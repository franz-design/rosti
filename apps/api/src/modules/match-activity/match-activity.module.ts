import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { MatchActivityController } from './match-activity.controller'
import { MatchActivity } from './match-activity.entity'
import { MatchActivityService } from './match-activity.service'

@Module({
  imports: [MikroOrmModule.forFeature([MatchActivity])],
  controllers: [MatchActivityController],
  providers: [MatchActivityService],
  exports: [MatchActivityService],
})
export class MatchActivityModule {}
