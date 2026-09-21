import { describe, expect, it } from 'vitest'
import { MatchStatus } from '../matches/contracts/match.contract'
import { canRemindScore, computeScoreReminderRunAt } from './score-reminder'

describe('computeScoreReminderRunAt', () => {
  it('schedules 90 minutes after kickoff when that is still in the future', () => {
    const inputStartsAt = new Date('2026-09-21T18:00:00.000Z')
    const inputNow = new Date('2026-09-21T10:00:00.000Z')

    const actual = computeScoreReminderRunAt(inputStartsAt, inputNow)

    expect(actual.toISOString()).toBe('2026-09-21T19:30:00.000Z')
  })

  it('runs immediately when the match already ended', () => {
    const inputStartsAt = new Date('2026-09-21T10:00:00.000Z')
    const inputNow = new Date('2026-09-21T18:00:00.000Z')

    const actual = computeScoreReminderRunAt(inputStartsAt, inputNow)

    expect(actual.toISOString()).toBe(inputNow.toISOString())
  })
})

describe('canRemindScore', () => {
  it('skips cancelled matches', () => {
    const actual = canRemindScore({
      status: MatchStatus.Cancelled,
      blueScore: null,
      redScore: null,
    })

    expect(actual).toBe(false)
  })

  it('skips when both scores are set, including 0-0', () => {
    const actual = canRemindScore({
      status: MatchStatus.Scheduled,
      blueScore: 0,
      redScore: 0,
    })

    expect(actual).toBe(false)
  })

  it('allows a match with a missing side', () => {
    const actual = canRemindScore({
      status: MatchStatus.Played,
      blueScore: 2,
      redScore: null,
    })

    expect(actual).toBe(true)
  })
})
