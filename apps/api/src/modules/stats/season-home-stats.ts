import { TeamSide } from '../matches/contracts/match.contract'
import { SeasonHomeStatsDto } from './contracts/stats.contract'

/** A pair only shows on the home page once they have been teammates at least twice. */
export const MIN_TEAMMATE_MATCHES = 2

export interface HomeStatsSeason {
  id: string
  name: string
}

export interface HomeStatsMatch {
  id: string
  blueScore?: number | null
  redScore?: number | null
}

export interface HomeStatsPlayerRow {
  matchId: string
  userId: string
  userName: string
  image?: string | null
}

export interface HomeStatsLineupRow extends HomeStatsPlayerRow {
  team: TeamSide
}

export interface HomeStatsGoalRow extends HomeStatsPlayerRow {
  goals: number
}

export interface ComputeSeasonHomeStatsInput {
  season: HomeStatsSeason | null
  viewerUserId: string
  matches: HomeStatsMatch[]
  attendances: HomeStatsPlayerRow[]
  lineups: HomeStatsLineupRow[]
  goals: HomeStatsGoalRow[]
}

interface PlayerTotals {
  userId: string
  userName: string
  image: string | null
  matchesPlayed: number
  goals: number
  wins: number
  losses: number
}

interface NamedPlayer {
  userId: string
  userName: string
  image: string | null
}

interface TeammatePair {
  playerA: NamedPlayer
  playerB: NamedPlayer
  matchesTogether: number
}

/**
 * Aggregates club and personal highlights for the active season home page.
 */
export function computeSeasonHomeStats(input: ComputeSeasonHomeStatsInput): SeasonHomeStatsDto {
  const players = new Map<string, PlayerTotals>()

  for (const row of input.attendances) {
    const player = ensurePlayer(players, row)
    player.matchesPlayed += 1
  }

  for (const row of input.goals) {
    const player = ensurePlayer(players, row)
    player.goals += row.goals
  }

  const lineupsByMatch = groupLineupsByMatch(input.lineups)
  for (const match of input.matches) {
    applyMatchResults({ match, lineups: lineupsByMatch.get(match.id) ?? [], players })
  }

  const viewer = players.get(input.viewerUserId)

  return {
    season: input.season,
    club: {
      matchesPlayed: input.matches.length,
      topScorer: pickLeader(players, (player) => player.goals),
      mostWins: pickLeader(players, (player) => player.wins),
      mostLosses: pickLeader(players, (player) => player.losses),
      mostPlayedTogether: pickTeammatePair(lineupsByMatch),
    },
    me: {
      matchesPlayed: viewer?.matchesPlayed ?? 0,
      goals: viewer?.goals ?? 0,
      wins: viewer?.wins ?? 0,
      losses: viewer?.losses ?? 0,
    },
  }
}

export function createEmptyHomeStats(season: HomeStatsSeason | null): SeasonHomeStatsDto {
  return computeSeasonHomeStats({
    season,
    viewerUserId: '',
    matches: [],
    attendances: [],
    lineups: [],
    goals: [],
  })
}

function ensurePlayer(
  players: Map<string, PlayerTotals>,
  row: { userId: string; userName: string; image?: string | null },
): PlayerTotals {
  const existing = players.get(row.userId)
  if (existing) {
    if (!existing.image && row.image) existing.image = row.image
    return existing
  }

  const created: PlayerTotals = {
    userId: row.userId,
    userName: row.userName,
    image: row.image ?? null,
    matchesPlayed: 0,
    goals: 0,
    wins: 0,
    losses: 0,
  }
  players.set(row.userId, created)
  return created
}

function groupLineupsByMatch(lineups: HomeStatsLineupRow[]): Map<string, HomeStatsLineupRow[]> {
  const grouped = new Map<string, HomeStatsLineupRow[]>()
  for (const row of lineups) {
    const current = grouped.get(row.matchId) ?? []
    current.push(row)
    grouped.set(row.matchId, current)
  }
  return grouped
}

function applyMatchResults(input: {
  match: HomeStatsMatch
  lineups: HomeStatsLineupRow[]
  players: Map<string, PlayerTotals>
}): void {
  const { match, lineups, players } = input
  if (match.blueScore == null || match.redScore == null) return
  if (match.blueScore === match.redScore) return

  const winningTeam = match.blueScore > match.redScore ? TeamSide.Blue : TeamSide.Red
  for (const row of lineups) {
    const player = ensurePlayer(players, row)
    if (row.team === winningTeam) {
      player.wins += 1
    } else {
      player.losses += 1
    }
  }
}

function pickLeader(
  players: Map<string, PlayerTotals>,
  getValue: (player: PlayerTotals) => number,
): { userId: string; userName: string; image: string | null; value: number } | null {
  let leader: { userId: string; userName: string; image: string | null; value: number } | null =
    null

  for (const player of players.values()) {
    const value = getValue(player)
    if (value <= 0) continue
    if (isBetterLeader(leader, player, value)) {
      leader = {
        userId: player.userId,
        userName: player.userName,
        image: player.image,
        value,
      }
    }
  }

  return leader
}

function isBetterLeader(
  current: { userName: string; value: number } | null,
  candidate: PlayerTotals,
  value: number,
): boolean {
  if (!current) return true
  if (value > current.value) return true
  if (value < current.value) return false
  return candidate.userName.localeCompare(current.userName) < 0
}

function pickTeammatePair(
  lineupsByMatch: Map<string, HomeStatsLineupRow[]>,
): TeammatePair | null {
  const pairs = new Map<string, TeammatePair>()

  for (const lineups of lineupsByMatch.values()) {
    addTeamPairs(pairs, lineups.filter((row) => row.team === TeamSide.Blue))
    addTeamPairs(pairs, lineups.filter((row) => row.team === TeamSide.Red))
  }

  let leader: TeammatePair | null = null
  for (const pair of pairs.values()) {
    if (pair.matchesTogether < MIN_TEAMMATE_MATCHES) continue
    if (!leader || isBetterPair(leader, pair)) {
      leader = pair
    }
  }
  return leader
}

function addTeamPairs(pairs: Map<string, TeammatePair>, teammates: HomeStatsLineupRow[]): void {
  const unique = uniquePlayers(teammates)
  for (let leftIndex = 0; leftIndex < unique.length; leftIndex++) {
    for (let rightIndex = leftIndex + 1; rightIndex < unique.length; rightIndex++) {
      const ordered = orderPlayers(unique[leftIndex], unique[rightIndex])
      const key = `${ordered.playerA.userId}:${ordered.playerB.userId}`
      const existing = pairs.get(key)
      if (existing) {
        existing.matchesTogether += 1
        continue
      }
      pairs.set(key, { ...ordered, matchesTogether: 1 })
    }
  }
}

function uniquePlayers(rows: HomeStatsLineupRow[]): NamedPlayer[] {
  const seen = new Map<string, NamedPlayer>()
  for (const row of rows) {
    if (!seen.has(row.userId)) {
      seen.set(row.userId, { userId: row.userId, userName: row.userName, image: row.image ?? null })
    }
  }
  return Array.from(seen.values())
}

function orderPlayers(
  left: NamedPlayer,
  right: NamedPlayer,
): { playerA: NamedPlayer; playerB: NamedPlayer } {
  if (left.userName.localeCompare(right.userName) <= 0) {
    return { playerA: left, playerB: right }
  }
  return { playerA: right, playerB: left }
}

function isBetterPair(current: TeammatePair, candidate: TeammatePair): boolean {
  if (candidate.matchesTogether > current.matchesTogether) return true
  if (candidate.matchesTogether < current.matchesTogether) return false
  const currentKey = `${current.playerA.userName}\0${current.playerB.userName}`
  const candidateKey = `${candidate.playerA.userName}\0${candidate.playerB.userName}`
  return candidateKey.localeCompare(currentKey) < 0
}
