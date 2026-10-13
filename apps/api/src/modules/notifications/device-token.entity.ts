import { Entity, Enum, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'
import { User } from '../auth/auth.entity'
import { DevicePlatform } from './contracts/notification.contract'

@Entity({ tableName: 'device_token' })
export class DeviceToken {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @ManyToOne(() => User, { fieldName: 'userId', deleteRule: 'cascade' })
  @Index()
  user!: User

  /** Native device token, or the Web Push endpoint. Endpoints are longer than 255 characters. */
  @Property({ type: 'text' })
  token!: string

  @Enum({ items: () => DevicePlatform })
  platform!: DevicePlatform

  @Property({ type: 'text', nullable: true })
  p256dh: string | null = null

  @Property({ type: 'text', nullable: true })
  authSecret: string | null = null

  /** One browser installation. Logout deletes only this row. */
  @Property({ type: 'uuid', nullable: true })
  @Index()
  installationId: string | null = null

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
