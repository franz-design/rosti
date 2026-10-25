import { describe, expect, it } from 'vitest'
import { MatchStatus } from './contracts/match.contract'
import { selectUpcomingMatchIds, type UpcomingMatchCandidate } from './add-member-to-upcoming-matches'

const now = new Date('2026-10-25T15:00:00.000Z')

function match(overrides: Partial<UpcomingMatchCandidate> = {}): UpcomingMatchCandidate {
  return {
    id: 'next-match',
    status: MatchStatus.Scheduled,
    startsAt: new Date('2026-10-25T18:00:00.000Z'),
    ...overrides,
  }
}

describe('selectUpcomingMatchIds', () => {
  it('keeps a scheduled match that has not started when the player has no answer yet', () => {
    const actual = selectUpcomingMatchIds({
      matches: [match()],
      attendedMatchIds: new Set(),
      now,
    })

    expect(actual).toEqual(['next-match'])
  })

  it('leaves a match the player has already answered', () => {
    const actual = selectUpcomingMatchIds({
      matches: [match()],
      attendedMatchIds: new Set(['next-match']),
      now,
    })

    expect(actual).toEqual([])
  })

  it('skips a match that has already started, even when it is still scheduled', () => {
    const actual = selectUpcomingMatchIds({
      matches: [
        match({ id: 'started', startsAt: new Date('2026-10-25T14:00:00.000Z') }),
        match({ id: 'starting-now', startsAt: now }),
      ],
      attendedMatchIds: new Set(),
      now,
    })

    expect(actual).toEqual([])
  })

  it('skips a cancelled or already played match', () => {
    const actual = selectUpcomingMatchIds({
      matches: [
        match({ id: 'cancelled', status: MatchStatus.Cancelled }),
        match({ id: 'played', status: MatchStatus.Played }),
        match({ id: 'still-open' }),
      ],
      attendedMatchIds: new Set(),
      now,
    })

    expect(actual).toEqual(['still-open'])
  })
})
