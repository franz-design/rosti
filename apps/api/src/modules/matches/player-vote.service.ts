import { EntityManager } from '@mikro-orm/core'
import { CreateRequestContext } from '@mikro-orm/decorators/legacy'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { OrganizationService } from '../auth/organization.service'
import { NotificationService } from '../notifications/notification.service'
import { MatchPlayerVote } from './match-player-vote.entity'
import { MatchAttendance } from './match-attendance.entity'
import { Match } from './match.entity'
import { AttendanceStatus } from './contracts/match.contract'
import {
  CastPlayerVoteInput,
  PlayerVotePhase,
  PlayerVoteStateDto,
} from './contracts/player-vote.contract'
import {
  computePlayerVoteClosesAt,
  ElectedPlayer,
  hasEveryoneVoted,
  isPlayerVoteReady,
  MIN_PLAYER_VOTE_PLAYERS,
  pickLatestMatch,
  PlayerVoteBallot,
  PresentVoter,
  resolvePlayerVote,
} from './player-vote'

@Injectable()
export class PlayerVoteService {
  private readonly logger = new Logger(PlayerVoteService.name)

  constructor(
    private readonly em: EntityManager,
    private readonly organizationService: OrganizationService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Opens, closes, or clears the best-player vote so it follows the match score and status.
   */
  async sync(match: Match): Promise<void> {
    if (!isPlayerVoteReady(match)) {
      await this.clearVote(match)
      return
    }
    if (match.playerVoteClosedAt) return

    const present = await this.listPresent(match.id)
    if (present.length < MIN_PLAYER_VOTE_PLAYERS) {
      await this.clearVote(match)
      return
    }
    if (!match.playerVoteOpenedAt) {
      await this.openVote(match, present)
      return
    }

    await this.closeIfComplete(match, present)
  }

  /**
   * Returns the vote card for this player.
   * Closes the vote when the deadline has passed or everyone has voted.
   */
  async getState(
    organizationId: string,
    userId: string,
    matchId: string,
  ): Promise<PlayerVoteStateDto> {
    await this.organizationService.requireMember(organizationId, userId)
    const match = await this.findMatch(organizationId, matchId)
    await this.settle(match)
    return this.buildState(match, userId)
  }

  /**
   * Records this player's choice. The choice can be changed until the vote closes.
   */
  async castVote(
    organizationId: string,
    userId: string,
    matchId: string,
    data: CastPlayerVoteInput,
  ): Promise<PlayerVoteStateDto> {
    await this.organizationService.requireMember(organizationId, userId)
    const match = await this.findMatch(organizationId, matchId)
    if (!isPlayerVoteReady(match) || !match.playerVoteOpenedAt || match.playerVoteClosedAt) {
      throw new BadRequestException('Voting is not open')
    }
    if (match.playerVoteClosesAt && match.playerVoteClosesAt.getTime() <= Date.now()) {
      await this.finishVote(match)
      throw new BadRequestException('Voting is closed')
    }
    if (data.nomineeUserId === userId) {
      throw new BadRequestException('You cannot vote for yourself')
    }

    const present = await this.listPresent(match.id)
    const presentById = new Map(present.map((row) => [row.user.id, row]))
    const voter = presentById.get(userId)
    const nominee = presentById.get(data.nomineeUserId)
    if (!voter) throw new BadRequestException('Only players who attended can vote')
    if (!nominee) throw new BadRequestException('You can only vote for a player who attended')

    let ballot = await this.em.findOne(MatchPlayerVote, {
      match: { id: match.id },
      voter: { id: userId },
    })
    if (!ballot) {
      ballot = new MatchPlayerVote()
      ballot.match = match
      ballot.voter = voter.user
      this.em.persist(ballot)
    }
    ballot.nominee = nominee.user
    await this.em.flush()
    await this.closeIfComplete(match, present)
    return this.buildState(match, userId)
  }

  /**
   * Closes votes whose 2-day window has ended, then tells the players who attended.
   */
  @CreateRequestContext()
  async closeExpiredVotes(): Promise<number> {
    const now = new Date()
    const matches = await this.em.find(
      Match,
      {
        playerVoteOpenedAt: { $ne: null },
        playerVoteClosedAt: null,
        playerVoteClosesAt: { $lte: now },
      },
      { limit: 50, orderBy: { playerVoteClosesAt: 'ASC' } },
    )

    let closed = 0
    for (const match of matches) {
      try {
        const didClose = await this.finishVote(match)
        if (didClose) closed += 1
      } catch (error) {
        this.logger.error(`Player vote close failed for match ${match.id}`, error)
      }
    }
    return closed
  }

  /**
   * Elected player of the latest played match, once that vote is closed.
   * A tie leaves the home card empty.
   */
  async findLastElectedPlayer(matches: Match[]): Promise<ElectedPlayer | null> {
    const last = pickLatestMatch(matches)
    if (!last?.playerVoteClosedAt || last.playerVoteIsTie) return null
    await this.em.populate(last, ['playerVoteWinner'])
    const winner = last.playerVoteWinner
    if (!winner) return null
    return {
      userId: winner.id,
      userName: winner.name,
      image: winner.image,
    }
  }

  private async settle(match: Match): Promise<void> {
    if (!isPlayerVoteReady(match) || !match.playerVoteOpenedAt || match.playerVoteClosedAt) return
    if (match.playerVoteClosesAt && match.playerVoteClosesAt.getTime() <= Date.now()) {
      await this.finishVote(match)
      return
    }
    const present = await this.listPresent(match.id)
    await this.closeIfComplete(match, present)
  }

  private async openVote(match: Match, present: MatchAttendance[]): Promise<void> {
    const openedAt = new Date()
    const closesAt = computePlayerVoteClosesAt(openedAt)
    const updated = await this.em.nativeUpdate(
      Match,
      { id: match.id, playerVoteOpenedAt: null },
      { playerVoteOpenedAt: openedAt, playerVoteClosesAt: closesAt },
    )
    if (updated === 0) return

    match.playerVoteOpenedAt = openedAt
    match.playerVoteClosesAt = closesAt
    await this.notificationService.notifyPlayerVoteOpened(
      match,
      present.map((row) => row.user),
    )
  }

  private async closeIfComplete(match: Match, present: MatchAttendance[]): Promise<void> {
    if (match.playerVoteClosedAt || !match.playerVoteOpenedAt) return
    const ballots = await this.listBallots(match.id)
    const complete = hasEveryoneVoted({
      presentUserIds: present.map((row) => row.user.id),
      ballots,
    })
    if (!complete) return
    await this.finishVote(match)
  }

  private async finishVote(match: Match): Promise<boolean> {
    if (!match.playerVoteOpenedAt || match.playerVoteClosedAt) return false
    if (!isPlayerVoteReady(match)) {
      await this.clearVote(match)
      return false
    }

    const present = await this.listPresent(match.id)
    const result = resolvePlayerVote({
      presentPlayers: present.map(toPresentVoter),
      ballots: await this.listBallots(match.id),
    })
    const winner = result.winner
      ? (present.find((row) => row.user.id === result.winner?.userId)?.user ?? null)
      : null
    const closedAt = new Date()
    const updated = await this.em.nativeUpdate(
      Match,
      { id: match.id, playerVoteClosedAt: null },
      {
        playerVoteClosedAt: closedAt,
        playerVoteIsTie: result.isTie,
        playerVoteWinner: winner,
      },
    )
    if (updated === 0) {
      await this.em.refresh(match)
      return false
    }

    match.playerVoteClosedAt = closedAt
    match.playerVoteIsTie = result.isTie
    match.playerVoteWinner = winner
    await this.notificationService.notifyPlayerVoteResult({
      match,
      users: present.map((row) => row.user),
      winnerName: result.winner?.userName ?? null,
      isTie: result.isTie,
    })
    return true
  }

  private async clearVote(match: Match): Promise<void> {
    const hasVote =
      match.playerVoteOpenedAt != null ||
      match.playerVoteClosedAt != null ||
      match.playerVoteWinner != null ||
      match.playerVoteIsTie
    if (!hasVote) return

    const ballots = await this.em.find(MatchPlayerVote, { match: { id: match.id } })
    for (const ballot of ballots) this.em.remove(ballot)
    match.playerVoteOpenedAt = null
    match.playerVoteClosesAt = null
    match.playerVoteClosedAt = null
    match.playerVoteIsTie = false
    match.playerVoteWinner = null
    await this.em.flush()
  }

  private async buildState(match: Match, viewerUserId: string): Promise<PlayerVoteStateDto> {
    if (!isPlayerVoteReady(match) || !match.playerVoteOpenedAt) {
      return emptyVoteState()
    }

    if (match.playerVoteClosedAt) {
      await this.em.populate(match, ['playerVoteWinner'])
      const winner = match.playerVoteIsTie ? null : match.playerVoteWinner
      return {
        phase: PlayerVotePhase.Closed,
        closesAt: match.playerVoteClosesAt,
        canVote: false,
        candidates: [],
        myNomineeUserId: null,
        winner: winner ? { userId: winner.id, userName: winner.name, image: winner.image } : null,
        isTie: match.playerVoteIsTie,
      }
    }

    const present = await this.listPresent(match.id)
    const viewerIsPresent = present.some((row) => row.user.id === viewerUserId)
    const myVote = viewerIsPresent
      ? await this.em.findOne(
          MatchPlayerVote,
          { match: { id: match.id }, voter: { id: viewerUserId } },
          { populate: ['nominee'] },
        )
      : null
    const candidates = present
      .filter((row) => row.user.id !== viewerUserId)
      .map(toPresentVoter)
      .sort((left, right) =>
        left.userName.localeCompare(right.userName, 'fr', { sensitivity: 'base' }),
      )
    const deadlinePassed =
      match.playerVoteClosesAt != null && match.playerVoteClosesAt.getTime() <= Date.now()

    return {
      phase: PlayerVotePhase.Open,
      closesAt: match.playerVoteClosesAt,
      canVote: viewerIsPresent && !deadlinePassed,
      candidates: viewerIsPresent ? candidates : [],
      myNomineeUserId: myVote?.nominee.id ?? null,
      winner: null,
      isTie: false,
    }
  }

  private async findMatch(organizationId: string, matchId: string): Promise<Match> {
    const match = await this.em.findOne(Match, {
      id: matchId,
      organization: { id: organizationId },
    })
    if (!match) throw new NotFoundException('Match not found')
    return match
  }

  private listPresent(matchId: string): Promise<MatchAttendance[]> {
    return this.em.find(
      MatchAttendance,
      { match: { id: matchId }, status: AttendanceStatus.Present },
      { populate: ['user'] },
    )
  }

  private async listBallots(matchId: string): Promise<PlayerVoteBallot[]> {
    const rows = await this.em.find(
      MatchPlayerVote,
      { match: { id: matchId } },
      { populate: ['voter', 'nominee'] },
    )
    return rows.map((row) => ({
      voterUserId: row.voter.id,
      nomineeUserId: row.nominee.id,
    }))
  }
}

function emptyVoteState(): PlayerVoteStateDto {
  return {
    phase: PlayerVotePhase.Unavailable,
    closesAt: null,
    canVote: false,
    candidates: [],
    myNomineeUserId: null,
    winner: null,
    isTie: false,
  }
}

function toPresentVoter(row: MatchAttendance): PresentVoter {
  return {
    userId: row.user.id,
    userName: row.user.name,
    image: row.user.image,
  }
}
