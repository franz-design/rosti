import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { MatchService } from './match.service'

@Injectable()
export class MatchStatusScheduler {
  private readonly logger = new Logger(MatchStatusScheduler.name)

  constructor(private readonly matchService: MatchService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async closeFinishedMatches(): Promise<void> {
    const count = await this.matchService.closeFinishedMatches()
    if (count > 0) {
      this.logger.log(`Marked ${count} matches as played`)
    }
  }
}
