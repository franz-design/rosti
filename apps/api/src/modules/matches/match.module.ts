import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module, forwardRef } from '@nestjs/common'
import { NotificationModule } from '../notifications/notification.module'
import { PaymentModule } from '../payments/payment.module'
import { MatchAttendance } from './match-attendance.entity'
import { MatchLineup } from './match-lineup.entity'
import { MatchPlayerVote } from './match-player-vote.entity'
import { MatchSeries } from './match-series.entity'
import { MatchStatusScheduler } from './match-status.scheduler'
import { MatchController } from './match.controller'
import { Match } from './match.entity'
import { MatchMapper } from './match.mapper'
import { MatchService } from './match.service'
import { PlayerVoteScheduler } from './player-vote.scheduler'
import { PlayerVoteService } from './player-vote.service'

@Module({
  imports: [
    MikroOrmModule.forFeature([Match, MatchSeries, MatchAttendance, MatchLineup, MatchPlayerVote]),
    forwardRef(() => NotificationModule),
    PaymentModule,
  ],
  controllers: [MatchController],
  providers: [
    MatchService,
    MatchMapper,
    PlayerVoteService,
    PlayerVoteScheduler,
    MatchStatusScheduler,
  ],
  exports: [MatchService, PlayerVoteService],
})
export class MatchModule {}
