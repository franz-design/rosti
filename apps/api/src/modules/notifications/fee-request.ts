import { MatchStatus } from '../matches/contracts/match.contract'
import { FeeStatus } from '../payments/contracts/payment.contract'
import { computeMatchEndNotificationRunAt } from './match-end'

/** A player is not reminded twice within this window, including a manual reminder. */
export const FEE_REMINDER_COOLDOWN_MS = 20 * 60 * 60 * 1000

export const DEFAULT_FEE_REMINDER_DELAYS_DAYS = [3, 7] as const

export function computeFeeRequestRunAt(
  startsAt: Date,
  durationMinutes: number,
  now: Date = new Date(),
): Date {
  return computeMatchEndNotificationRunAt(startsAt, durationMinutes, now)
}

/** The payment request email is sent once, and never for a cancelled match. */
export function shouldSendFeeRequest(input: {
  status: string
  feesNotifiedAt?: Date | null
  hasCost: boolean
}): boolean {
  if (!input.hasCost) return false
  if (input.status === MatchStatus.Cancelled) return false
  if (input.feesNotifiedAt) return false
  return true
}

export function shouldScheduleFeeRequest(input: {
  status: string
  feesNotifiedAt?: Date | null
  hasCost: boolean
  existingJobCount: number
}): boolean {
  if (!shouldSendFeeRequest(input)) return false
  return input.existingJobCount === 0
}

/** One reminder job per delay. An empty list means reminders are off. */
export function planFeeReminderRunAts(notifiedAt: Date, delaysDays: number[]): Date[] {
  const uniqueDays = [...new Set(delaysDays.filter((days) => days > 0))].sort(
    (left, right) => left - right,
  )
  return uniqueDays.map((days) => new Date(notifiedAt.getTime() + days * 24 * 60 * 60 * 1000))
}

/** Only an unpaid share is reminded, and not again within the cooldown. */
export function canRemindFee(input: {
  status: FeeStatus
  lastRemindedAt?: Date | null
  now: Date
}): boolean {
  if (input.status !== FeeStatus.Owed) return false
  if (!input.lastRemindedAt) return true
  return input.now.getTime() - input.lastRemindedAt.getTime() >= FEE_REMINDER_COOLDOWN_MS
}
