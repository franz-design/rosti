import { Module } from '@nestjs/common'
import { AvatarModule } from '../avatars/avatar.module'
import { NotificationModule } from '../notifications/notification.module'
import { ClubController } from './club.controller'

@Module({
  imports: [AvatarModule, NotificationModule],
  controllers: [ClubController],
})
export class ClubModule {}
