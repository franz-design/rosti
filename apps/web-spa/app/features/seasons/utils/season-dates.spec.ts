import { describe, expect, it } from 'vitest'
import type { Season } from '@/lib/rosti-api'
import {
  clampMatchDateToSeason,
  defaultSeasonWindow,
  formatCalendarDate,
  isCalendarEndBeforeStart,
  isMatchDateOutsideSeason,
  seasonWindowLabel,
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

describe('defaultSeasonWindow', () => {
  it('uses the current Sept–June season during the season', () => {
    expect(defaultSeasonWindow(new Date(2026, 9, 15))).toEqual({
      startsAt: new Date(2026, 8, 1),
      endsAt: new Date(2027, 5, 30),
      label: '2026-2027',
    })
  })

  it('uses the season that started last September in spring', () => {
    expect(defaultSeasonWindow(new Date(2026, 2, 10))).toEqual({
      startsAt: new Date(2025, 8, 1),
      endsAt: new Date(2026, 5, 30),
      label: '2025-2026',
    })
  })

  it('uses the upcoming season during summer', () => {
    expect(defaultSeasonWindow(new Date(2026, 6, 1))).toEqual({
      startsAt: new Date(2026, 8, 1),
      endsAt: new Date(2027, 5, 30),
      label: '2026-2027',
    })
  })
})

describe('clampMatchDateToSeason', () => {
  const seasonStartsAt = new Date(2026, 8, 1)
  const seasonEndsAt = new Date(2027, 5, 30)

  it('keeps a date inside the season', () => {
    expect(clampMatchDateToSeason(new Date(2026, 9, 5), seasonStartsAt, seasonEndsAt)).toEqual(
      new Date(2026, 9, 5),
    )
  })

  it('moves a date before the start to the same weekday on or after the start', () => {
    // Monday before season start → first Monday on/after 1 Sept 2026 (Tuesday) = 7 Sept
    expect(clampMatchDateToSeason(new Date(2026, 7, 24), seasonStartsAt, seasonEndsAt)).toEqual(
      new Date(2026, 8, 7),
    )
  })

  it('clamps a date after the end to the season end', () => {
    expect(clampMatchDateToSeason(new Date(2027, 7, 1), seasonStartsAt, seasonEndsAt)).toEqual(
      new Date(2027, 5, 30),
    )
  })
})

describe('isMatchDateOutsideSeason', () => {
  const seasonStartsAt = new Date(2026, 8, 1)
  const seasonEndsAt = new Date(2027, 5, 30)

  it('accepts dates inside the window', () => {
    expect(isMatchDateOutsideSeason(new Date(2026, 8, 1), seasonStartsAt, seasonEndsAt)).toBe(false)
    expect(isMatchDateOutsideSeason(new Date(2027, 5, 30), seasonStartsAt, seasonEndsAt)).toBe(false)
  })

  it('rejects dates outside the window', () => {
    expect(isMatchDateOutsideSeason(new Date(2026, 7, 31), seasonStartsAt, seasonEndsAt)).toBe(true)
    expect(isMatchDateOutsideSeason(new Date(2027, 6, 1), seasonStartsAt, seasonEndsAt)).toBe(true)
  })
})

describe('seasonWindowLabel', () => {
  it('uses a single year when start and end share the year', () => {
    expect(seasonWindowLabel(new Date(2026, 0, 1), new Date(2026, 11, 31))).toBe('2026')
  })

  it('uses a range when the season spans two years', () => {
    expect(seasonWindowLabel(new Date(2026, 8, 1), new Date(2027, 5, 30))).toBe('2026-2027')
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
