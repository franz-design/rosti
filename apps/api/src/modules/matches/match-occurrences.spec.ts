import { describe, expect, it } from 'vitest'
import { RecurrenceFrequency } from './contracts/match.contract'
import { buildOccurrenceDates } from './match-occurrences'

describe('buildOccurrenceDates', () => {
  it('defaults to 12 weekly occurrences when no end date is set', () => {
    const first = new Date(2026, 8, 7, 19, 0, 0)
    const dates = buildOccurrenceDates(first, { frequency: RecurrenceFrequency.Weekly })

    expect(dates).toHaveLength(12)
    expect(dates[0]).toEqual(first)
    expect(dates[11]?.getFullYear()).toBe(2026)
    expect(dates[11]?.getMonth()).toBe(10)
    expect(dates[11]?.getDate()).toBe(23)
    expect(dates[11]?.getHours()).toBe(19)
  })

  it('stops at endsAt when generating until the season end', () => {
    const first = new Date(2026, 8, 7, 19, 0, 0)
    const endsAt = new Date(2026, 8, 28, 23, 59, 59)
    const dates = buildOccurrenceDates(first, {
      frequency: RecurrenceFrequency.Weekly,
      endsAt,
    })

    expect(dates.map((date) => date.toISOString())).toEqual([
      new Date(2026, 8, 7, 19, 0, 0).toISOString(),
      new Date(2026, 8, 14, 19, 0, 0).toISOString(),
      new Date(2026, 8, 21, 19, 0, 0).toISOString(),
      new Date(2026, 8, 28, 19, 0, 0).toISOString(),
    ])
  })

  it('includes a match on the season end day when kickoff is before endsAt', () => {
    const first = new Date(2026, 5, 30, 19, 0, 0)
    const endsAt = new Date(2026, 5, 30, 23, 59, 59)
    const dates = buildOccurrenceDates(first, {
      frequency: RecurrenceFrequency.Weekly,
      endsAt,
    })

    expect(dates).toHaveLength(1)
    expect(dates[0]).toEqual(first)
  })
})
