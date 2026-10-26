import { describe, expect, it } from 'vitest'
import {
  computeMatchEndNotificationRunAt,
  earliestMatchEndKickoff,
  hasMatchEnded,
  latestKickoffThatHasEnded,
  latestKickoffThatMayHaveEnded,
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

describe('hasMatchEnded', () => {
  const kickoff = new Date('2026-10-13T18:00:00.000Z')

  it('is finished at kickoff plus the match length plus 15 minutes', () => {
    expect(hasMatchEnded(kickoff, 90, new Date('2026-10-13T19:45:00.000Z'))).toBe(true)
  })

  it('is still running one millisecond before that instant', () => {
    expect(hasMatchEnded(kickoff, 90, new Date('2026-10-13T19:44:59.999Z'))).toBe(false)
  })

  it('uses the club duration, and 90 minutes when the duration is unknown', () => {
    expect(hasMatchEnded(kickoff, 45, new Date('2026-10-13T19:00:00.000Z'))).toBe(true)
    expect(hasMatchEnded(kickoff, 120, new Date('2026-10-13T19:00:00.000Z'))).toBe(false)
    expect(hasMatchEnded(kickoff, 30, new Date('2026-10-13T19:45:00.000Z'))).toBe(true)
  })
})

describe('latestKickoffThatMayHaveEnded', () => {
  it('looks back across the shortest match plus the 15-minute margin', () => {
    const now = new Date('2026-10-13T20:00:00.000Z')

    expect(latestKickoffThatMayHaveEnded(now).toISOString()).toBe('2026-10-13T19:00:00.000Z')
  })
})

describe('latestKickoffThatHasEnded', () => {
  it('looks back across the longest match plus the 15-minute margin', () => {
    const now = new Date('2026-10-13T20:00:00.000Z')

    expect(latestKickoffThatHasEnded(now).toISOString()).toBe('2026-10-13T17:45:00.000Z')
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
