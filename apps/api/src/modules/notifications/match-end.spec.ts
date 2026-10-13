import { describe, expect, it } from 'vitest'
import {
  computeMatchEndNotificationRunAt,
  earliestMatchEndKickoff,
  readMatchDurationMinutes,
} from './match-end'

describe('readMatchDurationMinutes', () => {
  it('keeps a duration the club can choose', () => {
    expect(readMatchDurationMinutes(45)).toBe(45)
    expect(readMatchDurationMinutes(120)).toBe(120)
  })

  it('falls back to 90 minutes when the value is missing or unknown', () => {
    expect(readMatchDurationMinutes(undefined)).toBe(90)
    expect(readMatchDurationMinutes(30)).toBe(90)
  })
})

describe('computeMatchEndNotificationRunAt', () => {
  it('waits 15 minutes after the end', () => {
    const actual = computeMatchEndNotificationRunAt(
      new Date('2026-10-13T18:00:00.000Z'),
      75,
      new Date('2026-10-13T12:00:00.000Z'),
    )

    expect(actual.toISOString()).toBe('2026-10-13T19:30:00.000Z')
  })
})

describe('earliestMatchEndKickoff', () => {
  it('looks back across the longest match plus the catch-up window', () => {
    const now = new Date('2026-10-13T20:00:00.000Z')

    expect(earliestMatchEndKickoff(now).toISOString()).toBe('2026-10-13T11:45:00.000Z')
  })
})
