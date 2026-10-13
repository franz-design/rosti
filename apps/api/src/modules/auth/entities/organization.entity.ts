import { Entity, Enum, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy'
import { DEFAULT_MATCH_DURATION_MINUTES } from '../../notifications/match-end'

export enum SportType {
  Football = 'football',
  Futsal = 'futsal',
  Basketball = 'basketball',
  Volleyball = 'volleyball',
  Tennis = 'tennis',
  Padel = 'padel',
  Badminton = 'badminton',
  Other = 'other',
}

@Entity({ tableName: 'organization' })
export class Organization {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property()
  name!: string

  @Property({ nullable: true })
  @Unique()
  slug?: string

  @Property({ nullable: true })
  logo?: string

  @Property({ nullable: true, type: 'text' })
  metadata?: string

  /** Personal P2P payment link (Lydia, PayPal.me, etc.) */
  @Property({ nullable: true })
  paymentLink?: string

  /** Where matches are usually played */
  @Property({ nullable: true })
  venue?: string

  @Enum({ items: () => SportType, nullable: true })
  sportType?: SportType

  @Property({ nullable: true, type: 'int' })
  defaultMaxCapacity?: number

  /**
   * How long a match lasts, in minutes.
   * The score reminder and the payment request go out 15 minutes after this.
   */
  @Property({
    fieldName: 'matchDurationMinutes',
    type: 'int',
    default: DEFAULT_MATCH_DURATION_MINUTES,
  })
  matchDurationMinutes: number = DEFAULT_MATCH_DURATION_MINUTES

  /** Days before kickoff when the next match registration email is sent. */
  @Property({ fieldName: 'matchInviteLeadDays', type: 'int', default: 5 })
  matchInviteLeadDays: number = 5

  /** Optional reminder, in days before kickoff. Only unanswered players receive it. */
  @Property({
    fieldName: 'matchInviteReminderLeadDays',
    type: 'int',
    nullable: true,
  })
  matchInviteReminderLeadDays?: number

  /**
   * Days after the payment request when unpaid players are reminded.
   * An empty list turns reminders off. Default is 3 days, then 7 days.
   */
  @Property({ type: 'json', defaultRaw: `'[3,7]'::jsonb` })
  feeReminderDelaysDays: number[] = [3, 7]

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date()
}
