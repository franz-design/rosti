import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'
import type { MatchActivity } from '@/lib/rosti-api'
import { describeMatchActivity } from './describe-match-activity'

const mockT = ((key: string, params?: Record<string, unknown>) =>
  params ? `${key} ${JSON.stringify(params)}` : key) as unknown as TFunction

function buildActivity(entry: Pick<MatchActivity, 'action' | 'details'>): MatchActivity {
  return {
    id: 'activity-1',
    matchId: 'match-1',
    area: 'attendance',
    createdAt: '2026-11-18T10:00:00.000Z',
    ...entry,
  } as MatchActivity
}

describe('describeMatchActivity', () => {
  it('shows the attendance change from one status to the other', () => {
    const inputActivity = buildActivity({
      action: 'attendance_changed',
      details: { from: 'present', to: 'absent' },
    })

    const actual = describeMatchActivity({ activity: inputActivity, t: mockT, locale: 'fr-FR' })

    expect(actual).toBe(
      'matches.detail.activity.attendanceChanged {"change":"matches.detail.activity.attendanceStatus.present → matches.detail.activity.attendanceStatus.absent"}',
    )
  })

  it('shows a dash when the score was empty before', () => {
    const inputActivity = buildActivity({
      action: 'score_changed',
      details: { fromBlue: null, fromRed: null, toBlue: 3, toRed: 1 },
    })

    const actual = describeMatchActivity({ activity: inputActivity, t: mockT, locale: 'fr-FR' })

    expect(actual).toBe('matches.detail.activity.scoreChanged {"change":"– → 3 - 1"}')
  })

  it('passes the reminded player count for plural forms', () => {
    const inputActivity = buildActivity({
      action: 'fees_reminded',
      details: { remindedCount: 4 },
    })

    const actual = describeMatchActivity({ activity: inputActivity, t: mockT, locale: 'fr-FR' })

    expect(actual).toBe('matches.detail.activity.feesReminded {"count":4}')
  })
})
