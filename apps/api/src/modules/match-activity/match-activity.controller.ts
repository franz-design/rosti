import { TypedController, TypedParam, TypedRoute } from '@lonestone/nzoth/server'
import { BadRequestException, Query, UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { LoggedInBetterAuthSession } from '../auth/auth.config'
import { Session } from '../auth/auth.decorator'
import { AuthGuard } from '../auth/auth.guard'
import {
  MatchActivityDto,
  matchActivitiesSchema,
  matchActivityAreaQuerySchema,
} from './match-activity.contract'
import { toMatchActivityDto } from './match-activity.mapper'
import { MatchActivityService } from './match-activity.service'

@TypedController('clubs/:organizationId/matches/:matchId/activity', undefined, {
  tags: ['Match activity'],
})
@UseGuards(AuthGuard)
export class MatchActivityController {
  constructor(private readonly matchActivityService: MatchActivityService) {}

  @TypedRoute.Get('', matchActivitiesSchema)
  async list(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
    @Query('area') rawArea?: string,
  ): Promise<MatchActivityDto[]> {
    const area = matchActivityAreaQuerySchema.safeParse(rawArea)
    if (!area.success) throw new BadRequestException('Unknown activity area')

    const activities = await this.matchActivityService.listForMatch({
      organizationId,
      userId: session.user.id,
      matchId,
      area: area.data,
    })
    return activities.map(toMatchActivityDto)
  }
}
