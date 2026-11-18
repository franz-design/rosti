import { EntityManager } from '@mikro-orm/core'
import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '../auth/entities/user.entity'
import { OrganizationService } from '../auth/organization.service'
import { Match } from '../matches/match.entity'
import {
  MATCH_ACTIVITY_AREA_BY_ACTION,
  MatchActivityArea,
  MatchActivityEntry,
} from './match-activity.contract'
import { MatchActivity } from './match-activity.entity'

/** A match log holds a few dozen rows; this cap only guards against runaway clients. */
const MATCH_ACTIVITY_LIMIT = 300

export interface RecordMatchActivityInput {
  match: Match
  actorId: string
  subjectId?: string
  entry: MatchActivityEntry
}

@Injectable()
export class MatchActivityService {
  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService,
  ) {}

  /**
   * Queues one activity row. The caller's next flush saves it with the change it describes.
   * Only call this from a path a person triggered, never from a scheduler.
   */
  record(input: RecordMatchActivityInput): void {
    const activity = new MatchActivity()
    activity.match = input.match
    activity.actor = this.em.getReference(User, input.actorId)
    activity.subject = input.subjectId ? this.em.getReference(User, input.subjectId) : null
    activity.area = MATCH_ACTIVITY_AREA_BY_ACTION[input.entry.action]
    activity.action = input.entry.action
    activity.details = input.entry.details
    this.em.persist(activity)
  }

  async listForMatch(input: {
    organizationId: string
    userId: string
    matchId: string
    area?: MatchActivityArea
  }): Promise<MatchActivity[]> {
    await this.organizationService.requireRole(input.organizationId, input.userId, [
      'owner',
      'admin',
    ])
    const match = await this.em.findOne(Match, {
      id: input.matchId,
      organization: { id: input.organizationId },
    })
    if (!match) throw new NotFoundException('Match not found')

    return this.em.find(
      MatchActivity,
      {
        match: { id: match.id },
        ...(input.area ? { area: input.area } : {}),
      },
      {
        populate: ['actor', 'subject'],
        orderBy: { createdAt: 'DESC' },
        limit: MATCH_ACTIVITY_LIMIT,
      },
    )
  }
}
