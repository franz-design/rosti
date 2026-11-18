import type { TFunction } from 'i18next'
import type { MatchActivity } from '@/lib/rosti-api'
import { formatEuro } from './euros'

interface DescribeMatchActivityInput {
  activity: MatchActivity
  t: TFunction
  locale: string
}

/** Turns one logged change into a short sentence, such as "Present → Absent". */
export function describeMatchActivity({ activity, t, locale }: DescribeMatchActivityInput): string {
  const arrow = (from: string, to: string) => `${from} → ${to}`

  switch (activity.action) {
    case 'attendance_changed': {
      const from = activity.details.from ?? 'pending'
      return t('matches.detail.activity.attendanceChanged', {
        change: arrow(
          t(`matches.detail.activity.attendanceStatus.${from}`),
          t(`matches.detail.activity.attendanceStatus.${activity.details.to}`),
        ),
      })
    }
    case 'score_changed': {
      const { fromBlue, fromRed, toBlue, toRed } = activity.details
      return t('matches.detail.activity.scoreChanged', {
        change: arrow(formatScore(fromBlue, fromRed), formatScore(toBlue, toRed)),
      })
    }
    case 'player_stats_changed': {
      const { fromGoals, fromAssists, toGoals, toAssists } = activity.details
      return t('matches.detail.activity.playerStatsChanged', {
        goals: arrow(String(fromGoals), String(toGoals)),
        assists: arrow(String(fromAssists), String(toAssists)),
      })
    }
    case 'match_cost_changed': {
      const { fromPitchCents, fromExtrasCents, toPitchCents, toExtrasCents } = activity.details
      return t('matches.detail.activity.matchCostChanged', {
        pitch: arrow(formatEuro(fromPitchCents, locale), formatEuro(toPitchCents, locale)),
        extras: arrow(formatEuro(fromExtrasCents, locale), formatEuro(toExtrasCents, locale)),
      })
    }
    case 'fee_status_changed':
      return t('matches.detail.activity.feeStatusChanged', {
        change: arrow(
          t(`matches.detail.payments.status.${activity.details.from}`),
          t(`matches.detail.payments.status.${activity.details.to}`),
        ),
      })
    case 'fee_shares_changed':
      return t('matches.detail.activity.feeSharesChanged', {
        change: arrow(String(activity.details.from), String(activity.details.to)),
      })
    case 'fees_reminded':
      return t('matches.detail.activity.feesReminded', {
        count: activity.details.remindedCount,
      })
  }
}

function formatScore(blue: number | null, red: number | null): string {
  if (blue == null || red == null) return '–'
  return `${blue} - ${red}`
}
