import { describe, expect, it } from 'vitest'
import type { Match } from '../../../lib/rosti-api'
import { shouldShowMatchResult } from './match-filters'

function buildMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    organizationId: 'club-1',
    seasonId: 'season-1',
    title: 'Wednesday match',
    startsAt: '2026-09-20T18:00:00.000Z',
    maxCapacity: 10,
    status: 'played',
    createdAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('shouldShowMatchResult', () => {
  const now = Date.parse('2026-09-21T18:00:00.000Z')

  it('shows the result on a played match', () => {
    const inputMatch = buildMatch({ status: 'played' })
    expect(shouldShowMatchResult(inputMatch, now)).toBe(true)
  })

  it('shows the result on a scheduled match that already started', () => {
    const inputMatch = buildMatch({
      status: 'scheduled',
      startsAt: '2026-09-21T17:00:00.000Z',
    })
    expect(shouldShowMatchResult(inputMatch, now)).toBe(true)
  })

  it('hides the result on an upcoming match', () => {
    const inputMatch = buildMatch({
      status: 'scheduled',
      startsAt: '2026-09-22T18:00:00.000Z',
    })
    expect(shouldShowMatchResult(inputMatch, now)).toBe(false)
  })

  it('hides the result on a cancelled match', () => {
    const inputMatch = buildMatch({ status: 'cancelled' })
    expect(shouldShowMatchResult(inputMatch, now)).toBe(false)
  })
})
