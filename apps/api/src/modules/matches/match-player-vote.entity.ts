import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy'
import { User } from '../auth/entities/user.entity'
import { Match } from './match.entity'

@Entity({ tableName: 'match_player_vote' })
@Unique({ properties: ['match', 'voter'] })
export class MatchPlayerVote {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @ManyToOne(() => Match, { fieldName: 'matchId', deleteRule: 'cascade' })
  @Index()
  match!: Match

  @ManyToOne(() => User, { fieldName: 'voterId', deleteRule: 'cascade' })
  @Index()
  voter!: User

  @ManyToOne(() => User, { fieldName: 'nomineeId', deleteRule: 'cascade' })
  @Index()
  nominee!: User

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
