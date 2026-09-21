import { TypedBody, TypedController, TypedParam, TypedRoute } from '@lonestone/nzoth/server'
import { Query, UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { LoggedInBetterAuthSession } from '../auth/auth.config'
import { Session } from '../auth/auth.decorator'
import { AuthGuard } from '../auth/auth.guard'
import {
  attendancesSchema,
  CancelMatchInput,
  cancelMatchSchema,
  CreateMatchInput,
  createMatchSchema,
  lineupsSchema,
  MatchDto,
  matchSchema,
  matchesSchema,
  RespondAttendanceInput,
  respondAttendanceSchema,
  SetAttendanceInput,
  setAttendanceSchema,
  SetLineupInput,
  setLineupSchema,
  SetPlayerTeamInput,
  setPlayerTeamSchema,
  UpdateMatchInput,
  updateMatchSchema,
} from './contracts/match.contract'
import { Match } from './match.entity'
import { MatchMapper } from './match.mapper'
import { MatchService } from './match.service'

@TypedController('clubs/:organizationId/matches', undefined, { tags: ['Matches'] })
@UseGuards(AuthGuard)
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly matchMapper: MatchMapper,
  ) {}

  @TypedRoute.Post('', matchesSchema)
  async create(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedBody(createMatchSchema) body: CreateMatchInput,
  ): Promise<MatchDto[]> {
    const matches = await this.matchService.create(organizationId, session.user.id, body)
    return this.mapMatches(matches, session.user.id)
  }

  @TypedRoute.Get('', matchesSchema)
  async list(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @Query('seasonId') seasonId?: string,
  ): Promise<MatchDto[]> {
    const matches = await this.matchService.list(organizationId, session.user.id, seasonId)
    return this.mapMatches(matches, session.user.id)
  }

  @TypedRoute.Get(':matchId', matchSchema)
  async get(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
  ): Promise<MatchDto> {
    const match = await this.matchService.get(organizationId, session.user.id, matchId)
    return this.mapMatch(match, session.user.id)
  }

  @TypedRoute.Patch(':matchId', matchSchema)
  async update(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
    @TypedBody(updateMatchSchema) body: UpdateMatchInput,
  ): Promise<MatchDto> {
    const match = await this.matchService.update(organizationId, session.user.id, matchId, body)
    return this.mapMatch(match, session.user.id)
  }

  @TypedRoute.Post(':matchId/cancel', matchSchema)
  async cancel(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
    @TypedBody(cancelMatchSchema) body: CancelMatchInput,
  ): Promise<MatchDto> {
    const match = await this.matchService.cancel(organizationId, session.user.id, matchId, body)
    return this.mapMatch(match, session.user.id)
  }

  @TypedRoute.Post(':matchId/played', matchSchema)
  async markPlayed(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
  ): Promise<MatchDto> {
    const match = await this.matchService.markPlayed(organizationId, session.user.id, matchId)
    return this.mapMatch(match, session.user.id)
  }

  @TypedRoute.Get(':matchId/attendances', attendancesSchema)
  async listAttendances(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
  ) {
    const rows = await this.matchService.listAttendances(organizationId, session.user.id, matchId)
    return rows.map((r) => this.matchMapper.toAttendanceDto(r))
  }

  @TypedRoute.Post(':matchId/attendances/me', attendancesSchema.element)
  async respond(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
    @TypedBody(respondAttendanceSchema) body: RespondAttendanceInput,
  ) {
    const row = await this.matchService.respondAttendance(
      organizationId,
      session.user.id,
      matchId,
      body,
    )
    return this.matchMapper.toAttendanceDto(row)
  }

  @TypedRoute.Patch(':matchId/attendances/:userId', attendancesSchema.element)
  async setAttendance(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
    @TypedParam('userId', z.string().uuid()) userId: string,
    @TypedBody(setAttendanceSchema) body: SetAttendanceInput,
  ) {
    const row = await this.matchService.setAttendance(
      organizationId,
      session.user.id,
      matchId,
      userId,
      body,
    )
    return this.matchMapper.toAttendanceDto(row)
  }

  @TypedRoute.Get(':matchId/lineups', lineupsSchema)
  async listLineups(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
  ) {
    const rows = await this.matchService.listLineups(organizationId, session.user.id, matchId)
    return rows.map((r) => this.matchMapper.toLineupDto(r))
  }

  @TypedRoute.Put(':matchId/lineups', lineupsSchema)
  async setLineup(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
    @TypedBody(setLineupSchema) body: SetLineupInput,
  ) {
    const rows = await this.matchService.setLineup(organizationId, session.user.id, matchId, body)
    return rows.map((r) => this.matchMapper.toLineupDto(r))
  }

  @TypedRoute.Put(':matchId/lineups/:userId', lineupsSchema)
  async setPlayerTeam(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('matchId', z.string().uuid()) matchId: string,
    @TypedParam('userId', z.string().uuid()) userId: string,
    @TypedBody(setPlayerTeamSchema) body: SetPlayerTeamInput,
  ) {
    const rows = await this.matchService.setPlayerTeam(
      organizationId,
      session.user.id,
      matchId,
      userId,
      body.team,
    )
    return rows.map((r) => this.matchMapper.toLineupDto(r))
  }

  private async mapMatch(match: Match, userId: string): Promise<MatchDto> {
    const [presentCount, viewerTeams] = await Promise.all([
      this.matchService.countPresent(match.id),
      this.matchService.findViewerTeamsByMatchIds({ userId, matchIds: [match.id] }),
    ])
    return this.matchMapper.toDto(match, {
      presentCount,
      viewerTeam: viewerTeams.get(match.id),
    })
  }

  private async mapMatches(matches: Match[], userId: string): Promise<MatchDto[]> {
    const matchIds = matches.map((match) => match.id)
    const [presentCounts, viewerTeams] = await Promise.all([
      this.matchService.countPresentByMatchIds(matchIds),
      this.matchService.findViewerTeamsByMatchIds({ userId, matchIds }),
    ])
    return this.matchMapper.toDtos(matches, { presentCounts, viewerTeams })
  }
}
