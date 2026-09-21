import { describe, expect, it } from 'vitest'
import { sortUnassignedPlayersFirst } from './sort-available-players'

describe('sortUnassignedPlayersFirst', () => {
  it('keeps unassigned players above players already on a team', () => {
    const inputPlayers = [
      { userId: 'blue-1', name: 'Léa' },
      { userId: 'free-1', name: 'Marc' },
      { userId: 'red-1', name: 'Inès' },
      { userId: 'free-2', name: 'Paul' },
    ]
    const inputDraft = { 'blue-1': 'blue', 'red-1': 'red' }

    const actual = sortUnassignedPlayersFirst(inputPlayers, inputDraft)

    expect(actual.map((player) => player.userId)).toEqual(['free-1', 'free-2', 'blue-1', 'red-1'])
  })

  it('keeps the original order when every player is unassigned', () => {
    const inputPlayers = [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }]

    const actual = sortUnassignedPlayersFirst(inputPlayers, {})

    expect(actual.map((player) => player.userId)).toEqual(['a', 'b', 'c'])
  })
})
