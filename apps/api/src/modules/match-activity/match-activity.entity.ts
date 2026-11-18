import { Entity, Enum, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'
import { User } from '../auth/entities/user.entity'
import { Match } from '../matches/match.entity'
import {
  MatchActivityAction,
  MatchActivityArea,
  MatchActivityEntry,
} from './match-activity.contract'

/**
 * One change made by a person on a match (attendance, score, payments).
 * Rows are never updated. Automatic changes made by schedulers are not stored here.
 */
@Entity({ tableName: 'match_activity' })
@Index({ properties: ['match', 'area', 'createdAt'] })
export class MatchActivity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @ManyToOne(() => Match, { fieldName: 'matchId', deleteRule: 'cascade' })
  match!: Match

  /** Who made the change. Empty once that account is deleted. */
  @ManyToOne(() => User, { fieldName: 'actorId', nullable: true, deleteRule: 'set null' })
  actor?: User | null

  /** The player the change is about, when there is one. */
  @ManyToOne(() => User, { fieldName: 'subjectId', nullable: true, deleteRule: 'set null' })
  subject?: User | null

  @Enum({ items: () => MatchActivityArea })
  area!: MatchActivityArea

  @Enum({ items: () => MatchActivityAction })
  action!: MatchActivityAction

  @Property({ type: 'json' })
  details!: MatchActivityEntry['details']

  @Property()
  createdAt: Date = new Date()
}
