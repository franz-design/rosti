import { eurosToCents } from './euros'
import type { RecurrenceChoice } from './match-schedule-utils'

export const CREATE_MATCH_BASE_STEPS = ['match', 'when', 'group', 'repeat'] as const
export const CREATE_MATCH_LENGTH_STEP = 'length'

export interface CreateMatchStepInput {
  title: string
  matchDate: Date | undefined
  maxPlayers: number
  pitchCost: string
  recurrence: RecurrenceChoice
}

export function createMatchStepIds(recurrence: RecurrenceChoice): string[] {
  if (recurrence === 'once') return [...CREATE_MATCH_BASE_STEPS]
  return [...CREATE_MATCH_BASE_STEPS, CREATE_MATCH_LENGTH_STEP]
}

export function isCreateMatchStepReachable(input: CreateMatchStepInput, target: number): boolean {
  const last = input.recurrence === 'once' ? 4 : 5
  if (target > last || target < 1) return false
  if (target <= 1) return true
  if (!input.title.trim()) return false
  if (target >= 3 && !input.matchDate) return false
  if (target >= 4 && input.maxPlayers < 2) return false
  if (target >= 4 && eurosToCents(input.pitchCost) == null) return false
  return true
}
