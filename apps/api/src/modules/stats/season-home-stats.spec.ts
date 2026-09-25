import { describe, expect, it } from 'vitest'
import { TeamSide } from '../matches/contracts/match.contract'
import {
  computeSeasonHomeStats,
  createEmptyHomeStats,
  MIN_TEAMMATE_MATCHES,
} from './season-home-stats'

const SEASON = { id: '11111111-1111-4111-8111-111111111111', name: 'Saison 2026' }
const VIEWER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const LUCAS = { userId: VIEWER_ID, userName: 'Lucas Martin', image: null }
const HUGO = { userId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', userName: 'Hugo Bernard', image: null }
const ADAM = { userId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', userName: 'Adam Petit', image: null }
const LEO = { userId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', userName: 'Leo Durand', image: null }

describe('createEmptyHomeStats', () => {
  it('returns zeros and null highlights', () => {
    const actual = createEmptyHomeStats(SEASON)

    expect(actual).toEqual({
      season: SEASON,
      club: {
        matchesPlayed: 0,
        topScorer: null,
        mostWins: null,
        mostLosses: null,
        mostPlayedTogether: null,
      },
      me: { matchesPlayed: 0, goals: 0, wins: 0, losses: 0 },
    })
  })
})

describe('computeSeasonHomeStats', () => {
  it('counts played matches and personal attendance', () => {
    const actual = computeSeasonHomeStats({
      season: SEASON,
      viewerUserId: VIEWER_ID,
      matches: [{ id: 'm1', blueScore: 2, redScore: 1 }, { id: 'm2', blueScore: 0, redScore: 0 }],
      attendances: [
        { matchId: 'm1', ...LUCAS },
        { matchId: 'm1', ...HUGO },
        { matchId: 'm2', ...HUGO },
      ],
      lineups: [],
      goals: [],
    })

    expect(actual.club.matchesPlayed).toBe(2)
    expect(actual.me.matchesPlayed).toBe(1)
  })

  it('picks the top scorer and ignores zero goals', () => {
    const actual = computeSeasonHomeStats({
      season: SEASON,
      viewerUserId: VIEWER_ID,
      matches: [{ id: 'm1', blueScore: 3, redScore: 1 }],
      attendances: [
        { matchId: 'm1', ...LUCAS },
        { matchId: 'm1', ...HUGO },
      ],
      lineups: [],
      goals: [
        { matchId: 'm1', ...LUCAS, goals: 2 },
        { matchId: 'm1', ...HUGO, goals: 1 },
      ],
    })

    expect(actual.club.topScorer).toEqual({ ...LUCAS, value: 2 })
    expect(actual.me.goals).toBe(2)
  })

  it('breaks a scoring tie with the earlier name', () => {
    const actual = computeSeasonHomeStats({
      season: SEASON,
      viewerUserId: VIEWER_ID,
      matches: [{ id: 'm1', blueScore: 2, redScore: 0 }],
      attendances: [],
      lineups: [],
      goals: [
        { matchId: 'm1', ...LUCAS, goals: 2 },
        { matchId: 'm1', ...ADAM, goals: 2 },
      ],
    })

    expect(actual.club.topScorer?.userName).toBe(ADAM.userName)
  })

  it('counts wins and losses from lineup and score, and skips draws', () => {
    const actual = computeSeasonHomeStats({
      season: SEASON,
      viewerUserId: VIEWER_ID,
      matches: [
        { id: 'win', blueScore: 3, redScore: 1 },
        { id: 'loss', blueScore: 0, redScore: 2 },
        { id: 'loss-two', blueScore: 1, redScore: 4 },
        { id: 'draw', blueScore: 1, redScore: 1 },
      ],
      attendances: [
        { matchId: 'win', ...LUCAS },
        { matchId: 'loss', ...LUCAS },
        { matchId: 'loss-two', ...LUCAS },
        { matchId: 'draw', ...LUCAS },
      ],
      lineups: [
        { matchId: 'win', ...LUCAS, team: TeamSide.Blue },
        { matchId: 'win', ...HUGO, team: TeamSide.Red },
        { matchId: 'loss', ...LUCAS, team: TeamSide.Blue },
        { matchId: 'loss', ...HUGO, team: TeamSide.Red },
        { matchId: 'loss-two', ...LUCAS, team: TeamSide.Blue },
        { matchId: 'loss-two', ...HUGO, team: TeamSide.Red },
        { matchId: 'draw', ...LUCAS, team: TeamSide.Blue },
        { matchId: 'draw', ...HUGO, team: TeamSide.Red },
      ],
      goals: [],
    })

    expect(actual.club.mostWins).toEqual({ ...HUGO, value: 2 })
    expect(actual.club.mostLosses).toEqual({ ...LUCAS, value: 2 })
    expect(actual.me.wins).toBe(1)
    expect(actual.me.losses).toBe(2)
    expect(actual.me.matchesPlayed).toBe(4)
  })

  it('picks the pair that shared a team the most, not opponents', () => {
    const actual = computeSeasonHomeStats({
      season: SEASON,
      viewerUserId: VIEWER_ID,
      matches: [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }],
      attendances: [],
      lineups: [
        { matchId: 'm1', ...LUCAS, team: TeamSide.Blue },
        { matchId: 'm1', ...HUGO, team: TeamSide.Blue },
        { matchId: 'm1', ...ADAM, team: TeamSide.Red },
        { matchId: 'm1', ...LEO, team: TeamSide.Red },
        { matchId: 'm2', ...LUCAS, team: TeamSide.Blue },
        { matchId: 'm2', ...HUGO, team: TeamSide.Blue },
        { matchId: 'm2', ...ADAM, team: TeamSide.Red },
        { matchId: 'm3', ...LUCAS, team: TeamSide.Blue },
        { matchId: 'm3', ...ADAM, team: TeamSide.Blue },
        { matchId: 'm3', ...HUGO, team: TeamSide.Red },
        { matchId: 'm3', ...LEO, team: TeamSide.Red },
      ],
      goals: [],
    })

    expect(actual.club.mostPlayedTogether).toEqual({
      playerA: HUGO,
      playerB: LUCAS,
      matchesTogether: 2,
    })
  })

  it('hides a teammate pair below the minimum overlap', () => {
    const actual = computeSeasonHomeStats({
      season: SEASON,
      viewerUserId: VIEWER_ID,
      matches: [{ id: 'm1' }],
      attendances: [],
      lineups: [
        { matchId: 'm1', ...LUCAS, team: TeamSide.Blue },
        { matchId: 'm1', ...HUGO, team: TeamSide.Blue },
      ],
      goals: [],
    })

    expect(MIN_TEAMMATE_MATCHES).toBe(2)
    expect(actual.club.mostPlayedTogether).toBeNull()
  })
})
