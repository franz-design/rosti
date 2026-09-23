import { Entity, Enum, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy'

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

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date()
}
