import { describe, expect, it } from 'vitest'
import { MatchStatus } from '../matches/contracts/match.contract'
import { FeeStatus } from '../payments/contracts/payment.contract'
import {
  canRemindFee,
  computeFeeRequestRunAt,
  planFeeReminderRunAts,
  shouldScheduleFeeRequest,
  shouldSendFeeRequest,
} from './fee-request'

const NOW = new Date('2026-10-12T12:00:00.000Z')

describe('computeFeeRequestRunAt', () => {
  it('schedules 15 minutes after the configured duration', () => {
    const actual = computeFeeRequestRunAt(
      new Date('2026-10-12T12:00:00.000Z'),
      90,
      new Date('2026-10-12T10:00:00.000Z'),
    )

    expect(actual.toISOString()).toBe('2026-10-12T13:45:00.000Z')
  })

  it('runs immediately when the session already ended', () => {
    const actual = computeFeeRequestRunAt(new Date('2026-10-12T08:00:00.000Z'), 90, NOW)

    expect(actual.toISOString()).toBe(NOW.toISOString())
  })
})

describe('shouldSendFeeRequest', () => {
  it('sends once, for a match that has a cost', () => {
    expect(
      shouldSendFeeRequest({
        status: MatchStatus.Scheduled,
        hasCost: true,
        feesNotifiedAt: null,
      }),
    ).toBe(true)
  })

  it('does not send twice', () => {
    expect(
      shouldSendFeeRequest({
        status: MatchStatus.Played,
        hasCost: true,
        feesNotifiedAt: NOW,
      }),
    ).toBe(false)
  })

  it('skips a cancelled match', () => {
    expect(
      shouldSendFeeRequest({
        status: MatchStatus.Cancelled,
        hasCost: true,
        feesNotifiedAt: null,
      }),
    ).toBe(false)
  })

  it('skips a match with no cost', () => {
    expect(
      shouldSendFeeRequest({
        status: MatchStatus.Scheduled,
        hasCost: false,
        feesNotifiedAt: null,
      }),
    ).toBe(false)
  })
})

describe('shouldScheduleFeeRequest', () => {
  it('does not plan a second job when one already exists', () => {
    expect(
      shouldScheduleFeeRequest({
        status: MatchStatus.Scheduled,
        hasCost: true,
        feesNotifiedAt: null,
        existingJobCount: 1,
      }),
    ).toBe(false)
  })
})

describe('planFeeReminderRunAts', () => {
  it('plans one reminder per club delay', () => {
    const actual = planFeeReminderRunAts(NOW, [7, 3, 3])

    expect(actual.map((date) => date.toISOString())).toEqual([
      '2026-10-15T12:00:00.000Z',
      '2026-10-19T12:00:00.000Z',
    ])
  })

  it('plans nothing when reminders are turned off', () => {
    expect(planFeeReminderRunAts(NOW, [])).toEqual([])
  })
})

describe('canRemindFee', () => {
  it('reminds an unpaid share', () => {
    expect(canRemindFee({ status: FeeStatus.Owed, lastRemindedAt: null, now: NOW })).toBe(true)
  })

  it('skips a share that is already paid', () => {
    expect(canRemindFee({ status: FeeStatus.Paid, lastRemindedAt: null, now: NOW })).toBe(false)
  })

  it('skips a share that was waived', () => {
    expect(canRemindFee({ status: FeeStatus.Waived, lastRemindedAt: null, now: NOW })).toBe(false)
  })

  it('does not remind twice within 20 hours', () => {
    const recent = new Date(NOW.getTime() - 19 * 60 * 60 * 1000)

    expect(canRemindFee({ status: FeeStatus.Owed, lastRemindedAt: recent, now: NOW })).toBe(false)
  })

  it('reminds again after 20 hours', () => {
    const old = new Date(NOW.getTime() - 21 * 60 * 60 * 1000)

    expect(canRemindFee({ status: FeeStatus.Owed, lastRemindedAt: old, now: NOW })).toBe(true)
  })
})
