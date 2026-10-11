import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module, forwardRef } from '@nestjs/common'
import { EmailModule } from '../email/email.module'
import { PaymentModule } from '../payments/payment.module'
import { DeviceToken } from './device-token.entity'
import { NotificationController } from './notification.controller'
import { UnsubscribeController } from './unsubscribe.controller'
import { NotificationPreference } from './notification-preference.entity'
import { NotificationScheduler } from './notification.scheduler'
import { NotificationService } from './notification.service'
import { ScheduledJob } from './scheduled-job.entity'

@Module({
  imports: [
    EmailModule,
    MikroOrmModule.forFeature([NotificationPreference, DeviceToken, ScheduledJob]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [NotificationController, UnsubscribeController],
  providers: [NotificationService, NotificationScheduler],
  exports: [NotificationService],
})
export class NotificationModule {}
