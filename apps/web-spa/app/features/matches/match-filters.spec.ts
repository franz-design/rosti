import { describe, expect, it } from 'vitest'
import type { Match } from '@/lib/rosti-api'
import {
  getLastMatch,
  getNextMatch,
  hasMatchScore,
  isPastMatch,
  isUpcomingMatch,
  listPastMatches,
  listUpcomingMatches,
} from './match-filters'

const NOW = Date.parse('2026-09-14T12:00:00.000Z')

function createMatch(overrides: Partial<Match>): Match {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    organizationId: '22222222-2222-4222-8222-222222222222',
    seasonId: '33333333-3333-4333-8333-333333333333',
    title: 'Match',
    startsAt: '2026-09-14T12:00:00.000Z',
    maxCapacity: 10,
    status: 'scheduled',
    createdAt: '2026-09-01T12:00:00.000Z',
    ...overrides,
  }
}

describe('isUpcomingMatch', () => {
  it('keeps a scheduled match that has not started', () => {
    const inputMatch = createMatch({ startsAt: '2026-09-14T18:00:00.000Z' })

    const actual = isUpcomingMatch(inputMatch, NOW)

    expect(actual).toBe(true)
  })

  it('rejects a scheduled match that already started', () => {
    const inputMatch = createMatch({ startsAt: '2026-09-14T10:00:00.000Z' })

    const actual = isUpcomingMatch(inputMatch, NOW)

    expect(actual).toBe(false)
  })

  it('rejects a played match even if the kickoff is later', () => {
    const inputMatch = createMatch({
      status: 'played',
      startsAt: '2026-09-20T18:00:00.000Z',
    })

    const actual = isUpcomingMatch(inputMatch, NOW)

    expect(actual).toBe(false)
  })
})

describe('isPastMatch', () => {
  it('includes a match that already started', () => {
    const inputMatch = createMatch({ startsAt: '2026-09-14T10:00:00.000Z' })

    const actual = isPastMatch(inputMatch, NOW)

    expect(actual).toBe(true)
  })

  it('includes a played match', () => {
    const inputMatch = createMatch({
      status: 'played',
      startsAt: '2026-09-20T18:00:00.000Z',
    })

    const actual = isPastMatch(inputMatch, NOW)

    expect(actual).toBe(true)
  })

  it('excludes a scheduled match that has not started', () => {
    const inputMatch = createMatch({ startsAt: '2026-09-14T18:00:00.000Z' })

    const actual = isPastMatch(inputMatch, NOW)

    expect(actual).toBe(false)
  })
})

describe('listUpcomingMatches / listPastMatches', () => {
  it('sorts upcoming soonest first and past most recent first', () => {
    const inputSoon = createMatch({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      startsAt: '2026-09-15T18:00:00.000Z',
    })
    const inputLater = createMatch({
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      startsAt: '2026-09-22T18:00:00.000Z',
    })
    const inputYesterday = createMatch({
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      startsAt: '2026-09-13T18:00:00.000Z',
      status: 'played',
    })
    const inputLastWeek = createMatch({
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      startsAt: '2026-09-07T18:00:00.000Z',
      status: 'played',
    })
    const inputMatches = [inputLater, inputLastWeek, inputSoon, inputYesterday]

    const actualUpcoming = listUpcomingMatches(inputMatches, NOW)
    const actualPast = listPastMatches(inputMatches, NOW)

    expect(actualUpcoming.map((match) => match.id)).toEqual([inputSoon.id, inputLater.id])
    expect(actualPast.map((match) => match.id)).toEqual([inputYesterday.id, inputLastWeek.id])
  })
})

describe('getNextMatch / getLastMatch', () => {
  it('returns the soonest upcoming match', () => {
    const inputSoon = createMatch({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      startsAt: '2026-09-15T18:00:00.000Z',
    })
    const inputLater = createMatch({
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      startsAt: '2026-09-22T18:00:00.000Z',
    })

    const actual = getNextMatch([inputLater, inputSoon], NOW)

    expect(actual?.id).toBe(inputSoon.id)
  })

  it('skips cancelled matches when picking the last match', () => {
    const inputCancelled = createMatch({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      startsAt: '2026-09-13T18:00:00.000Z',
      status: 'cancelled',
    })
    const inputPlayed = createMatch({
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      startsAt: '2026-09-07T18:00:00.000Z',
      status: 'played',
    })

    const actual = getLastMatch([inputCancelled, inputPlayed], NOW)

    expect(actual?.id).toBe(inputPlayed.id)
  })
})

describe('hasMatchScore', () => {
  it('treats 0–0 as a recorded score', () => {
    const inputMatch = createMatch({ blueScore: 0, redScore: 0 })

    expect(hasMatchScore(inputMatch)).toBe(true)
  })

  it('rejects a match with a missing side', () => {
    const inputMatch = createMatch({ blueScore: 2 })

    expect(hasMatchScore(inputMatch)).toBe(false)
  })
})
