import { TypedBody, TypedController, TypedParam, TypedRoute } from '@lonestone/nzoth/server'
import { EntityManager } from '@mikro-orm/core'
import { NotFoundException, UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { LoggedInBetterAuthSession } from '../auth/auth.config'
import { Session } from '../auth/auth.decorator'
import { AuthGuard } from '../auth/auth.guard'
import { OrganizationService } from '../auth/organization.service'
import { AttendanceStatus } from '../matches/contracts/match.contract'
import { MatchAttendance } from '../matches/match-attendance.entity'
import { Match } from '../matches/match.entity'
import { NotificationService } from '../notifications/notification.service'
import {
  clubPaymentLinkSchema,
  matchCostSchema,
  remindFeesResultSchema,
  sessionFeeSchema,
  sessionFeesSchema,
  UpdateFeeSharesInput,
  UpdateFeeStatusInput,
  updateFeeSharesSchema,
  updateFeeStatusSchema,
  UpsertMatchCostInput,
  upsertMatchCostSchema,
} from './contracts/payment.contract'
import { toSessionFeeDto } from './payment.mapper'
import { PaymentService } from './payment.service'

@TypedController('clubs/:organizationId', undefined, { tags: ['Payments'] })
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly organizationService: OrganizationService,
    private readonly notificationService: NotificationService,
    private readonly em: EntityManager,
  ) {}

  @TypedRoute.Put('matches/:matchId/cost', matchCostSchema)
  async upsertCost(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
    @TypedBody(upsertMatchCostSchema) body: UpsertMatchCostInput,
  ) {
    const { cost, sharePriceCents, presentCount } = await this.paymentService.upsertMatchCost(
      organizationId,
      session.user.id,
      matchId,
      body,
    )
    await this.notificationService.scheduleFeeRequest(cost.match)
    return {
      id: cost.id,
      matchId,
      pitchCostCents: cost.pitchCostCents,
      extrasCostCents: cost.extrasCostCents,
      perPlayerCents: presentCount > 0 ? sharePriceCents : undefined,
      presentCount,
    }
  }

  @TypedRoute.Get('matches/:matchId/fees', sessionFeesSchema)
  async listFees(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
  ) {
    const { fees, paymentLink } = await this.paymentService.getMatchCost(
      organizationId,
      session.user.id,
      matchId,
    )
    return fees.map((fee) => toSessionFeeDto(fee, paymentLink))
  }

  @TypedRoute.Get('matches/:matchId/cost', matchCostSchema)
  async getCost(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
  ) {
    const { cost, fees } = await this.paymentService.getMatchCost(
      organizationId,
      session.user.id,
      matchId,
    )
    const present = await this.em.find(
      MatchAttendance,
      {
        match: { id: matchId },
        status: AttendanceStatus.Present,
      },
      { populate: ['user'] },
    )
    const presentIds = new Set(present.map((attendance) => attendance.user.id))
    const presentShares = fees
      .filter((fee) => presentIds.has(fee.user.id))
      .reduce((sum, fee) => sum + fee.shares, 0)
    const total = (cost?.pitchCostCents ?? 0) + (cost?.extrasCostCents ?? 0)
    const perPlayerCents =
      presentShares > 0
        ? Math.ceil(total / presentShares)
        : present.length > 0
          ? Math.ceil(total / present.length)
          : undefined
    return {
      id: cost?.id ?? '00000000-0000-0000-0000-000000000000',
      matchId,
      pitchCostCents: cost?.pitchCostCents ?? 0,
      extrasCostCents: cost?.extrasCostCents ?? 0,
      perPlayerCents,
      presentCount: present.length,
    }
  }

  @TypedRoute.Patch('fees/:feeId', sessionFeeSchema)
  async updateFee(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('feeId', z.string().uuid()) feeId: string,
    @TypedBody(updateFeeStatusSchema) body: UpdateFeeStatusInput,
  ) {
    const fee = await this.paymentService.updateFeeStatus(
      organizationId,
      session.user.id,
      feeId,
      body,
    )
    const org = await this.organizationService.getOrganizationById(organizationId)
    return toSessionFeeDto(fee, org?.paymentLink)
  }

  @TypedRoute.Patch('fees/:feeId/shares', sessionFeeSchema)
  async updateFeeShares(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('feeId', z.string().uuid()) feeId: string,
    @TypedBody(updateFeeSharesSchema) body: UpdateFeeSharesInput,
  ) {
    const fee = await this.paymentService.updateFeeShares(
      organizationId,
      session.user.id,
      feeId,
      body.shares,
    )
    const org = await this.organizationService.getOrganizationById(organizationId)
    return toSessionFeeDto(fee, org?.paymentLink)
  }

  @TypedRoute.Post('matches/:matchId/fees/remind', remindFeesResultSchema)
  async remindUnpaid(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
  ) {
    await this.organizationService.requireRole(organizationId, session.user.id, ['owner', 'admin'])
    const match = await this.em.findOne(Match, {
      id: matchId,
      organization: { id: organizationId },
    })
    if (!match) throw new NotFoundException('Match not found')
    const remindedCount = await this.notificationService.remindUnpaidFees(match)
    return { remindedCount }
  }

  @TypedRoute.Put('payment-link', clubPaymentLinkSchema)
  async setPaymentLink(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedBody(clubPaymentLinkSchema) body: { paymentLink?: string | null },
  ) {
    const org = await this.organizationService.updatePaymentLink(
      organizationId,
      session.user.id,
      body.paymentLink ?? null,
    )
    return { paymentLink: org.paymentLink }
  }

  @TypedRoute.Get('payment-link', clubPaymentLinkSchema)
  async getPaymentLink(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
  ) {
    await this.organizationService.requireMember(organizationId, session.user.id)
    const org = await this.organizationService.getOrganizationById(organizationId)
    return { paymentLink: org?.paymentLink }
  }
}
