import { describe, expect, it } from 'vitest'
import { lineupsOfPresentPlayers } from './lineups-of-present-players'

describe('lineupsOfPresentPlayers', () => {
  it('keeps only present players who are in the lineup', () => {
    const lineups = [
      { userId: 'present', team: 'blue' },
      { userId: 'absent', team: 'blue' },
      { userId: 'pending', team: 'red' },
    ]
    const attendances = [
      { userId: 'present', status: 'present' },
      { userId: 'absent', status: 'absent' },
      { userId: 'pending', status: 'pending' },
    ]

    expect(lineupsOfPresentPlayers(lineups, attendances)).toEqual([
      { userId: 'present', team: 'blue' },
    ])
  })
})
