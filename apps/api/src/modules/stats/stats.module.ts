import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { MatchModule } from '../matches/match.module'
import { MatchStat } from './match-stat.entity'
import { PlayerSkill } from './player-skill.entity'
import { StatsController } from './stats.controller'
import { StatsService } from './stats.service'

@Module({
  imports: [MikroOrmModule.forFeature([MatchStat, PlayerSkill]), MatchModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
