import { EntityManager } from '@mikro-orm/core'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Organization } from '../auth/auth.entity'
import { OrganizationService } from '../auth/organization.service'
import { CreateSeasonInput, SeasonStatus, UpdateSeasonInput } from './contracts/season.contract'
import { dayBeforeUtc, isEndBeforeStart, windowAfterClose } from './season-activity'
import { Season } from './season.entity'

@Injectable()
export class SeasonService {
  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(organizationId: string, userId: string, data: CreateSeasonInput): Promise<Season> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const organization = await this.em.findOne(Organization, { id: organizationId })
    if (!organization) throw new NotFoundException('Club not found')
    this.assertDateOrder(data.startsAt, data.endsAt)

    const season = new Season()
    season.organization = organization
    season.name = data.name
    season.startsAt = data.startsAt
    season.endsAt = data.endsAt
    season.status = SeasonStatus.Active

    await this.closeOtherActiveSeasons(organizationId, undefined, dayBeforeUtc(data.startsAt))
    this.em.persist(season)
    await this.em.flush()
    return season
  }

  async list(organizationId: string, userId: string): Promise<Season[]> {
    await this.organizationService.requireMember(organizationId, userId)
    return this.em.find(
      Season,
      { organization: { id: organizationId } },
      { populate: ['organization'], orderBy: { startsAt: 'DESC' } },
    )
  }

  async get(organizationId: string, userId: string, seasonId: string): Promise<Season> {
    await this.organizationService.requireMember(organizationId, userId)
    const season = await this.em.findOne(
      Season,
      { id: seasonId, organization: { id: organizationId } },
      { populate: ['organization'] },
    )
    if (!season) throw new NotFoundException('Season not found')
    return season
  }

  async update(
    organizationId: string,
    userId: string,
    seasonId: string,
    data: UpdateSeasonInput,
  ): Promise<Season> {
    await this.organizationService.requireRole(organizationId, userId, ['owner', 'admin'])
    const season = await this.get(organizationId, userId, seasonId)
    if (data.name !== undefined) season.name = data.name
    if (data.startsAt !== undefined) season.startsAt = data.startsAt
    if (data.endsAt !== undefined) season.endsAt = data.endsAt ?? null
    if (data.status !== undefined) season.status = data.status
    this.assertDateOrder(season.startsAt, season.endsAt)

    if (season.status === SeasonStatus.Active) {
      await this.closeOtherActiveSeasons(organizationId, season.id, dayBeforeUtc(season.startsAt))
    }

    await this.em.flush()
    return season
  }

  private assertDateOrder(startsAt: Date, endsAt?: Date | null): void {
    if (isEndBeforeStart(startsAt, endsAt)) {
      throw new BadRequestException('Season end date must be on or after the start date')
    }
  }

  private async closeOtherActiveSeasons(
    organizationId: string,
    keepSeasonId: string | undefined,
    closedEndsAt: Date,
  ): Promise<void> {
    const activeSeasons = await this.em.find(Season, {
      organization: { id: organizationId },
      status: SeasonStatus.Active,
    })

    for (const season of activeSeasons) {
      if (season.id === keepSeasonId) continue
      const next = windowAfterClose(season, closedEndsAt)
      season.status = next.status
      if (next.endsAt) season.endsAt = next.endsAt
    }
  }
}
