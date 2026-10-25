import { describe, expect, it } from 'vitest'
import { MatchStatus } from './contracts/match.contract'
import {
  selectUpcomingMatchesToDelete,
  type DeletableMatchCandidate,
} from './delete-upcoming-matches'

const now = new Date('2026-10-25T16:00:00.000Z')

function match(overrides: Partial<DeletableMatchCandidate> = {}): DeletableMatchCandidate {
  return {
    id: 'future-match',
    status: MatchStatus.Scheduled,
    startsAt: new Date('2026-10-26T18:00:00.000Z'),
    ...overrides,
  }
}

describe('selectUpcomingMatchesToDelete', () => {
  it('keeps scheduled matches that have not started', () => {
    const startingNow = match({
      id: 'starting-now',
      startsAt: now,
    })
    const actual = selectUpcomingMatchesToDelete({
      now,
      matches: [
        startingNow,
        match(),
        match({ id: 'started', startsAt: new Date('2026-10-25T15:59:00.000Z') }),
        match({ id: 'played', status: MatchStatus.Played }),
        match({ id: 'cancelled', status: MatchStatus.Cancelled }),
      ],
    })

    expect(actual.map((item) => item.id)).toEqual(['starting-now', 'future-match'])
  })

  it('returns only the chosen match when it is still upcoming', () => {
    const chosen = match({ id: 'chosen' })
    const actual = selectUpcomingMatchesToDelete({
      now,
      matchId: chosen.id,
      matches: [chosen, match({ id: 'other' })],
    })

    expect(actual.map((item) => item.id)).toEqual(['chosen'])
  })

  it('returns nothing when the chosen match has already started', () => {
    const actual = selectUpcomingMatchesToDelete({
      now,
      matchId: 'started',
      matches: [match({ id: 'started', startsAt: new Date('2026-10-25T15:00:00.000Z') })],
    })

    expect(actual).toEqual([])
  })
})
