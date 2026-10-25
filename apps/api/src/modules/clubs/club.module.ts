import { Module } from '@nestjs/common'
import { AvatarModule } from '../avatars/avatar.module'
import { NotificationModule } from '../notifications/notification.module'
import { PaymentModule } from '../payments/payment.module'
import { ClubController } from './club.controller'

@Module({
  imports: [AvatarModule, NotificationModule, PaymentModule],
  controllers: [ClubController],
})
export class ClubModule {}
