import { MatchStatus } from './contracts/match.contract'

const DAY_MS = 24 * 60 * 60 * 1000

/** How long players have to vote once the vote opens. */
export const PLAYER_VOTE_WINDOW_MS = 2 * DAY_MS

/** A player needs someone else to vote for, so a vote needs two people present. */
export const MIN_PLAYER_VOTE_PLAYERS = 2

export interface PlayerVoteMatchState {
  status: string
  blueScore?: number | null
  redScore?: number | null
}

export interface PresentVoter {
  userId: string
  userName: string
  image?: string | null
}

export interface PlayerVoteBallot {
  voterUserId: string
  nomineeUserId: string
}

export interface ElectedPlayer {
  userId: string
  userName: string
  image: string | null
}

export interface PlayerVoteOutcome {
  winner: ElectedPlayer | null
  isTie: boolean
}

/**
 * A vote can start once the match is finished and both scores are filled in.
 * A 0–0 score counts as filled in.
 */
export function isPlayerVoteReady(match: PlayerVoteMatchState): boolean {
  return match.status === MatchStatus.Played && match.blueScore != null && match.redScore != null
}

export function computePlayerVoteClosesAt(openedAt: Date): Date {
  return new Date(openedAt.getTime() + PLAYER_VOTE_WINDOW_MS)
}

/**
 * Counts valid ballots. A ballot counts when both players attended and the voter did not pick themselves.
 * A tie elects nobody.
 */
export function resolvePlayerVote(input: {
  presentPlayers: PresentVoter[]
  ballots: PlayerVoteBallot[]
}): PlayerVoteOutcome {
  const presentIds = new Set(input.presentPlayers.map((player) => player.userId))
  const players = new Map(input.presentPlayers.map((player) => [player.userId, player]))
  const counts = new Map<string, number>()

  for (const ballot of input.ballots) {
    if (!isValidBallot(ballot, presentIds)) continue
    counts.set(ballot.nomineeUserId, (counts.get(ballot.nomineeUserId) ?? 0) + 1)
  }

  let topCount = 0
  const leaders: string[] = []
  for (const [userId, count] of counts) {
    if (count > topCount) {
      topCount = count
      leaders.length = 0
      leaders.push(userId)
    } else if (count === topCount) {
      leaders.push(userId)
    }
  }

  if (topCount === 0 || leaders.length !== 1) {
    return { winner: null, isTie: leaders.length > 1 }
  }

  const player = players.get(leaders[0])
  if (!player) return { winner: null, isTie: false }

  return {
    winner: {
      userId: player.userId,
      userName: player.userName,
      image: player.image ?? null,
    },
    isTie: false,
  }
}

/**
 * True when every present player has a valid ballot.
 * With fewer than two present players, the vote cannot finish early.
 */
export function hasEveryoneVoted(input: {
  presentUserIds: string[]
  ballots: PlayerVoteBallot[]
}): boolean {
  if (input.presentUserIds.length < MIN_PLAYER_VOTE_PLAYERS) return false

  const presentIds = new Set(input.presentUserIds)
  const voted = new Set<string>()
  for (const ballot of input.ballots) {
    if (!isValidBallot(ballot, presentIds)) continue
    voted.add(ballot.voterUserId)
  }

  return input.presentUserIds.every((userId) => voted.has(userId))
}

export interface OpenPlayerVoteMatch {
  id: string
  startsAt: Date
  playerVoteOpenedAt?: Date | null
  playerVoteClosedAt?: Date | null
  playerVoteClosesAt?: Date | null
}

/**
 * Match id of the latest played match while players can still vote.
 * A closed vote, a tie, or a window that has already ended leaves this empty.
 */
export function pickOpenPlayerVoteMatchId(
  matches: OpenPlayerVoteMatch[],
  now: Date,
): string | null {
  const last = pickLatestMatch(matches)
  if (!last?.playerVoteOpenedAt || last.playerVoteClosedAt) return null
  if (last.playerVoteClosesAt && last.playerVoteClosesAt.getTime() <= now.getTime()) return null
  return last.id
}

export function pickLatestMatch<T extends { id: string; startsAt: Date }>(matches: T[]): T | null {
  let latest: T | null = null
  for (const match of matches) {
    if (!latest || isLaterMatch(match, latest)) latest = match
  }
  return latest
}

function isValidBallot(ballot: PlayerVoteBallot, presentIds: Set<string>): boolean {
  if (ballot.voterUserId === ballot.nomineeUserId) return false
  return presentIds.has(ballot.voterUserId) && presentIds.has(ballot.nomineeUserId)
}

function isLaterMatch(
  candidate: { id: string; startsAt: Date },
  current: { id: string; startsAt: Date },
): boolean {
  const delta = candidate.startsAt.getTime() - current.startsAt.getTime()
  if (delta !== 0) return delta > 0
  return candidate.id > current.id
}
