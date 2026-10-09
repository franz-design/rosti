import { OptionalProps } from '@mikro-orm/core'
import { Entity, Enum, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'
import { Organization } from '../auth/entities/organization.entity'
import { User } from '../auth/entities/user.entity'
import { Season } from '../seasons/season.entity'
import { MatchStatus } from './contracts/match.contract'
import { MatchSeries } from './match-series.entity'

@Entity({ tableName: 'match' })
export class Match {
  [OptionalProps]?: 'playerVoteIsTie'

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @ManyToOne(() => Organization, { fieldName: 'organizationId', deleteRule: 'cascade' })
  @Index()
  organization!: Organization

  @ManyToOne(() => Season, { fieldName: 'seasonId', deleteRule: 'cascade' })
  @Index()
  season!: Season

  @ManyToOne(() => MatchSeries, { fieldName: 'seriesId', nullable: true, deleteRule: 'set null' })
  series?: MatchSeries

  @Property()
  title!: string

  @Property({ fieldName: 'startsAt' })
  @Index()
  startsAt!: Date

  @Property({ nullable: true })
  location?: string

  @Property({ fieldName: 'maxCapacity' })
  maxCapacity!: number

  @Enum({ items: () => MatchStatus, default: MatchStatus.Scheduled })
  status: MatchStatus = MatchStatus.Scheduled

  @Property({ nullable: true })
  blueScore?: number

  @Property({ nullable: true })
  redScore?: number

  @Property({ type: 'timestamptz', nullable: true })
  playerVoteOpenedAt: Date | null = null

  @Property({ type: 'timestamptz', nullable: true })
  @Index()
  playerVoteClosesAt: Date | null = null

  @Property({ type: 'timestamptz', nullable: true })
  playerVoteClosedAt: Date | null = null

  @Property({ default: false })
  playerVoteIsTie: boolean = false

  @ManyToOne(() => User, {
    fieldName: 'playerVoteWinnerId',
    nullable: true,
    deleteRule: 'set null',
  })
  playerVoteWinner?: User | null

  @Property({ type: 'json', nullable: true })
  reminderOffsetsHours?: number[]

  @ManyToOne(() => User, { fieldName: 'createdById' })
  createdBy!: User

  @Property({ nullable: true, type: 'text' })
  cancellationReason?: string | null

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
