import { describe, expect, it } from 'vitest'
import {
  buildMatchRecurrencePayload,
  clampOccurrenceCount,
  DEFAULT_OCCURRENCE_COUNT,
  MAX_OCCURRENCE_COUNT,
} from './match-schedule-utils'

describe('clampOccurrenceCount', () => {
  it('keeps a value inside the allowed range', () => {
    expect(clampOccurrenceCount(8)).toBe(8)
  })

  it('falls back to the default when the value is not a number', () => {
    expect(clampOccurrenceCount(Number.NaN)).toBe(DEFAULT_OCCURRENCE_COUNT)
  })

  it('clamps below 1 and above the maximum', () => {
    expect(clampOccurrenceCount(0)).toBe(1)
    expect(clampOccurrenceCount(MAX_OCCURRENCE_COUNT + 10)).toBe(MAX_OCCURRENCE_COUNT)
  })
})

describe('buildMatchRecurrencePayload', () => {
  it('returns nothing for a one-off match', () => {
    const actualPayload = buildMatchRecurrencePayload({
      recurrence: 'once',
      endMode: 'count',
      occurrenceCount: 12,
    })
    expect(actualPayload).toBeUndefined()
  })

  it('sends a clamped occurrence count', () => {
    const actualPayload = buildMatchRecurrencePayload({
      recurrence: 'weekly',
      endMode: 'count',
      occurrenceCount: 80,
    })
    expect(actualPayload).toEqual({
      frequency: 'weekly',
      occurrenceCount: MAX_OCCURRENCE_COUNT,
    })
  })

  it('sends the season end date when that mode is selected', () => {
    const actualPayload = buildMatchRecurrencePayload({
      recurrence: 'weekly',
      endMode: 'season',
      occurrenceCount: 12,
      seasonEndsAtIso: '2027-06-30T23:59:59.999Z',
    })
    expect(actualPayload).toEqual({
      frequency: 'weekly',
      endsAt: '2027-06-30T23:59:59.999Z',
    })
  })

  it('falls back to a count when season end is missing', () => {
    const actualPayload = buildMatchRecurrencePayload({
      recurrence: 'monthly',
      endMode: 'season',
      occurrenceCount: 6,
    })
    expect(actualPayload).toEqual({
      frequency: 'monthly',
      occurrenceCount: 6,
    })
  })
})
