import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module, forwardRef } from '@nestjs/common'
import { NotificationModule } from '../notifications/notification.module'
import { MatchCost } from './match-cost.entity'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { SessionFee } from './session-fee.entity'

@Module({
  imports: [
    MikroOrmModule.forFeature([MatchCost, SessionFee]),
    forwardRef(() => NotificationModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
