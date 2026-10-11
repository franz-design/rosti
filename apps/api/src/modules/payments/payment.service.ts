import { EntityManager } from '@mikro-orm/core'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { OrganizationService } from '../auth/organization.service'
import { AttendanceStatus } from '../matches/contracts/match.contract'
import { MatchAttendance } from '../matches/match-attendance.entity'
import { Match } from '../matches/match.entity'
import { FeeStatus, UpdateFeeStatusInput, UpsertMatchCostInput } from './contracts/payment.contract'
import { planFeeUpdates } from './fee-split'
import { MatchCost } from './match-cost.entity'
import { SessionFee } from './session-fee.entity'

export interface RecomputeFeesResult {
  fees: SessionFee[]
  sharePriceCents: number
  presentCount: number
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService,
  ) {}

  async upsertMatchCost(
    organizationId: string,
    userId: string,
    matchId: string,
    data: UpsertMatchCostInput,
  ): Promise<{ cost: MatchCost } & RecomputeFeesResult> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const match = await this.em.findOne(Match, {
      id: matchId,
      organization: { id: organizationId },
    })
    if (!match) throw new NotFoundException('Match not found')

    let cost = await this.em.findOne(MatchCost, { match: { id: matchId } })
    if (!cost) {
      cost = new MatchCost()
      cost.match = match
      this.em.persist(cost)
    }
    cost.pitchCostCents = data.pitchCostCents
    cost.extrasCostCents = data.extrasCostCents
    await this.em.flush()

    const result = await this.recomputeFees(matchId)
    return { cost, ...result }
  }

  /**
   * Rebuilds one share per present player.
   * Keeps status, paid date and share count. Drops an unpaid share when the player is no longer present.
   */
  async recomputeFees(matchId: string): Promise<RecomputeFeesResult> {
    const cost = await this.em.findOne(
      MatchCost,
      { match: { id: matchId } },
      { populate: ['match'] },
    )
    if (!cost) return { fees: [], sharePriceCents: 0, presentCount: 0 }

    const present = await this.em.find(
      MatchAttendance,
      { match: { id: matchId }, status: AttendanceStatus.Present },
      { populate: ['user'] },
    )
    const existing = await this.em.find(
      SessionFee,
      { match: { id: matchId } },
      { populate: ['user', 'match'] },
    )
    const plan = planFeeUpdates({
      totalCents: cost.pitchCostCents + cost.extrasCostCents,
      presentUserIds: present.map((attendance) => attendance.user.id),
      existing: existing.map((fee) => ({
        userId: fee.user.id,
        shares: fee.shares,
        status: fee.status,
        amountCents: fee.amountCents,
      })),
    })

    const presentByUser = new Map(present.map((attendance) => [attendance.user.id, attendance]))
    const existingByUser = new Map(existing.map((fee) => [fee.user.id, fee]))
    const fees: SessionFee[] = []

    for (const item of plan.fees) {
      const current = existingByUser.get(item.userId)
      if (item.remove) {
        if (current) this.em.remove(current)
        continue
      }

      let fee = current
      if (!fee) {
        const attendance = presentByUser.get(item.userId)
        if (!attendance) continue
        fee = new SessionFee()
        fee.match = cost.match
        fee.user = attendance.user
        fee.status = FeeStatus.Owed
        this.em.persist(fee)
      }
      fee.shares = item.shares
      fee.amountCents = item.amountCents
      fees.push(fee)
    }

    await this.em.flush()
    return {
      fees,
      sharePriceCents: plan.sharePriceCents,
      presentCount: present.length,
    }
  }

  async getMatchCost(
    organizationId: string,
    userId: string,
    matchId: string,
  ): Promise<{ cost: MatchCost | null; fees: SessionFee[]; paymentLink?: string }> {
    await this.organizationService.requireMember(organizationId, userId)
    const cost = await this.em.findOne(
      MatchCost,
      { match: { id: matchId, organization: { id: organizationId } } },
      { populate: ['match'] },
    )
    const fees = await this.em.find(
      SessionFee,
      { match: { id: matchId, organization: { id: organizationId } } },
      { populate: ['user', 'match'] },
    )
    const org = await this.organizationService.getOrganizationById(organizationId)
    return { cost, fees, paymentLink: org?.paymentLink }
  }

  async updateFeeStatus(
    organizationId: string,
    userId: string,
    feeId: string,
    data: UpdateFeeStatusInput,
  ): Promise<SessionFee> {
    const fee = await this.em.findOne(
      SessionFee,
      { id: feeId, match: { organization: { id: organizationId } } },
      { populate: ['user', 'match', 'match.organization'] },
    )
    if (!fee) throw new NotFoundException('Fee not found')

    const isSelf = fee.user.id === userId
    if (!isSelf) {
      await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    } else if (data.status === FeeStatus.Waived) {
      throw new BadRequestException('Players cannot waive their own fee')
    }

    fee.status = data.status
    fee.paidAt = data.status === FeeStatus.Paid ? new Date() : undefined
    await this.em.flush()
    return fee
  }

  /**
   * Sets how many shares one present player covers, then recalculates every share.
   */
  async updateFeeShares(
    organizationId: string,
    userId: string,
    feeId: string,
    shares: number,
  ): Promise<SessionFee> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const fee = await this.em.findOne(
      SessionFee,
      { id: feeId, match: { organization: { id: organizationId } } },
      { populate: ['user', 'match'] },
    )
    if (!fee) throw new NotFoundException('Fee not found')

    const isPresent = await this.em.count(MatchAttendance, {
      match: { id: fee.match.id },
      user: { id: fee.user.id },
      status: AttendanceStatus.Present,
    })
    if (isPresent === 0) {
      throw new BadRequestException('Only a present player can take extra shares')
    }

    fee.shares = shares
    const { fees } = await this.recomputeFees(fee.match.id)
    return fees.find((item) => item.id === fee.id) ?? fee
  }
}
