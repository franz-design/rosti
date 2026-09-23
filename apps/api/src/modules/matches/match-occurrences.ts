import { RecurrenceFrequency } from './contracts/match.contract'

export interface OccurrenceRecurrence {
  frequency: RecurrenceFrequency
  endsAt?: Date
  occurrenceCount?: number
}

const DEFAULT_COUNT = 12
const MAX_UNTIL_END = 52

/**
 * Builds match start dates from a first kickoff and a recurrence rule.
 * When `endsAt` is set without a count, generates until that date (capped).
 */
export function buildOccurrenceDates(first: Date, recurrence: OccurrenceRecurrence): Date[] {
  const count = recurrence.occurrenceCount ?? (recurrence.endsAt ? MAX_UNTIL_END : DEFAULT_COUNT)

  if (recurrence.frequency === RecurrenceFrequency.MonthlyNthWeekday) {
    const weekday = first.getDay()
    const nth = getNthWeekdayOfMonth(first)
    const dates: Date[] = [new Date(first)]
    let year = first.getFullYear()
    let month = first.getMonth()
    while (dates.length < count) {
      month += 1
      if (month > 11) {
        month = 0
        year += 1
      }
      const next = nthWeekdayOfMonth(year, month, weekday, nth, first)
      if (recurrence.endsAt && next > recurrence.endsAt) break
      dates.push(next)
    }
    return dates
  }

  const dates: Date[] = []
  let current = new Date(first)
  for (let i = 0; i < count; i++) {
    if (recurrence.endsAt && current > recurrence.endsAt) break
    dates.push(new Date(current))
    if (recurrence.frequency === RecurrenceFrequency.Weekly) {
      current = new Date(current)
      current.setDate(current.getDate() + 7)
    } else if (recurrence.frequency === RecurrenceFrequency.Monthly) {
      current = new Date(current)
      current.setMonth(current.getMonth() + 1)
    } else {
      current = new Date(current)
      current.setDate(current.getDate() + 7)
    }
  }
  return dates
}

/** 1 = first occurrence of weekday in month, 5 = last possible */
function getNthWeekdayOfMonth(date: Date): number {
  return Math.floor((date.getDate() - 1) / 7) + 1
}

function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number,
  timeSource: Date,
): Date {
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekday = firstOfMonth.getDay()
  let day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  if (day > daysInMonth) {
    day -= 7
  }
  const result = new Date(year, month, day)
  result.setHours(
    timeSource.getHours(),
    timeSource.getMinutes(),
    timeSource.getSeconds(),
    timeSource.getMilliseconds(),
  )
  return result
}
