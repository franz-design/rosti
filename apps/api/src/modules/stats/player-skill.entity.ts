import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy'
import { Organization, User } from '../auth/auth.entity'

@Entity({ tableName: 'player_skill' })
@Unique({ properties: ['organization', 'user', 'skill'] })
export class PlayerSkill {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @ManyToOne(() => Organization, { fieldName: 'organizationId', deleteRule: 'cascade' })
  @Index()
  organization!: Organization

  @ManyToOne(() => User, { fieldName: 'userId', deleteRule: 'cascade' })
  user!: User

  @Property()
  skill!: string

  @Property({ type: 'integer' })
  value!: number

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
