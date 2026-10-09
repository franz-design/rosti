import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PlayerVoteService } from './player-vote.service'

@Injectable()
export class PlayerVoteScheduler {
  private readonly logger = new Logger(PlayerVoteScheduler.name)

  constructor(private readonly playerVoteService: PlayerVoteService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredVotes(): Promise<void> {
    const count = await this.playerVoteService.closeExpiredVotes()
    if (count > 0) {
      this.logger.log(`Closed ${count} player votes`)
    }
  }
}
