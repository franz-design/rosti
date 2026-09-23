import { Module } from '@nestjs/common'
import { NotificationModule } from '../notifications/notification.module'
import { ClubController } from './club.controller'

@Module({
  imports: [NotificationModule],
  controllers: [ClubController],
})
export class ClubModule {}
