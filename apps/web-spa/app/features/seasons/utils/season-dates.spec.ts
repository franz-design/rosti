import { describe, expect, it } from 'vitest'
import type { Season } from '@/lib/rosti-api'
import {
  formatCalendarDate,
  isCalendarEndBeforeStart,
  sortSeasons,
  suggestedSeasonStart,
  toCalendarDateString,
} from './season-dates'

function buildSeason(overrides: Partial<Season> = {}): Season {
  return {
    id: 'season-1',
    organizationId: 'club-1',
    name: 'Saison 2026',
    startsAt: '2026-09-01',
    status: 'active',
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('toCalendarDateString', () => {
  it('uses the local calendar day', () => {
    const actual = toCalendarDateString(new Date(2026, 8, 1))

    expect(actual).toBe('2026-09-01')
  })
})

describe('formatCalendarDate', () => {
  it('formats a date-only value without shifting the day', () => {
    const actual = formatCalendarDate('2026-09-01', 'fr-FR')

    expect(actual).toContain('2026')
    expect(actual).toContain('1')
  })
})

describe('isCalendarEndBeforeStart', () => {
  it('accepts the same day', () => {
    const inputDay = new Date(2026, 8, 1)

    expect(isCalendarEndBeforeStart(inputDay, inputDay)).toBe(false)
  })

  it('rejects an earlier end date', () => {
    expect(isCalendarEndBeforeStart(new Date(2026, 8, 2), new Date(2026, 8, 1))).toBe(true)
  })
})

describe('suggestedSeasonStart', () => {
  const inputToday = new Date(2026, 8, 21)

  it('starts today when the active season has no end date', () => {
    expect(suggestedSeasonStart(null, inputToday)).toEqual(new Date(2026, 8, 21))
  })

  it('starts the day after a future end date', () => {
    expect(suggestedSeasonStart('2026-12-31', inputToday)).toEqual(new Date(2027, 0, 1))
  })

  it('starts today when the previous season already ended', () => {
    expect(suggestedSeasonStart('2026-06-30', inputToday)).toEqual(new Date(2026, 8, 21))
  })
})

describe('sortSeasons', () => {
  it('puts the active season first, then the latest start date', () => {
    const inputSeasons = [
      buildSeason({ id: 'old', status: 'closed', startsAt: '2024-09-01' }),
      buildSeason({ id: 'recent-closed', status: 'closed', startsAt: '2025-09-01' }),
      buildSeason({ id: 'current', status: 'active', startsAt: '2026-09-01' }),
    ]

    const actual = sortSeasons(inputSeasons).map((season) => season.id)

    expect(actual).toEqual(['current', 'recent-closed', 'old'])
  })
})
