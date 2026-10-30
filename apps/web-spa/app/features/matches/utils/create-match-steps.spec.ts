import { describe, expect, it } from 'vitest'
import { createMatchStepIds, isCreateMatchStepReachable } from './create-match-steps'

const ready = {
  title: 'Mercredi',
  matchDate: new Date(2026, 9, 28),
  maxPlayers: 10,
  pitchCost: '30',
  recurrence: 'weekly' as const,
}

describe('createMatchStepIds', () => {
  it('hides the length step for a one-off match', () => {
    expect(createMatchStepIds('once')).toEqual(['match', 'when', 'group', 'repeat'])
  })

  it('adds the length step when the match repeats', () => {
    expect(createMatchStepIds('weekly')).toEqual(['match', 'when', 'group', 'repeat', 'length'])
  })
})

describe('isCreateMatchStepReachable', () => {
  it('keeps later steps closed until the earlier ones are filled', () => {
    expect(isCreateMatchStepReachable({ ...ready, title: '  ' }, 2)).toBe(false)
    expect(isCreateMatchStepReachable({ ...ready, matchDate: undefined }, 3)).toBe(false)
    expect(isCreateMatchStepReachable({ ...ready, maxPlayers: 1 }, 4)).toBe(false)
    expect(isCreateMatchStepReachable({ ...ready, pitchCost: 'abc' }, 4)).toBe(false)
    expect(isCreateMatchStepReachable(ready, 5)).toBe(true)
  })

  it('stops after repeat when the match happens once', () => {
    expect(isCreateMatchStepReachable({ ...ready, recurrence: 'once' }, 4)).toBe(true)
    expect(isCreateMatchStepReachable({ ...ready, recurrence: 'once' }, 5)).toBe(false)
  })
})
