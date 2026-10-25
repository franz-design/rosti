import { MatchStatus } from '../matches/contracts/match.contract'
import { shouldApplyDefaultPitchCost } from './default-pitch-cost'

const now = new Date('2026-10-25T12:00:00.000Z')

describe('shouldApplyDefaultPitchCost', () => {
  it('includes a scheduled match that has not started', () => {
    const actual = shouldApplyDefaultPitchCost(
      {
        status: MatchStatus.Scheduled,
        startsAt: new Date('2026-10-25T18:00:00.000Z'),
      },
      now,
    )

    expect(actual).toBe(true)
  })

  it('skips a match that has already started', () => {
    const actual = shouldApplyDefaultPitchCost(
      {
        status: MatchStatus.Scheduled,
        startsAt: new Date('2026-10-25T11:00:00.000Z'),
      },
      now,
    )

    expect(actual).toBe(false)
  })

  it('skips a match that starts at the current time', () => {
    const actual = shouldApplyDefaultPitchCost(
      { status: MatchStatus.Scheduled, startsAt: now },
      now,
    )

    expect(actual).toBe(false)
  })

  it('skips a cancelled match', () => {
    const actual = shouldApplyDefaultPitchCost(
      {
        status: MatchStatus.Cancelled,
        startsAt: new Date('2026-10-26T18:00:00.000Z'),
      },
      now,
    )

    expect(actual).toBe(false)
  })

  it('skips a played match', () => {
    const actual = shouldApplyDefaultPitchCost(
      {
        status: MatchStatus.Played,
        startsAt: new Date('2026-10-26T18:00:00.000Z'),
      },
      now,
    )

    expect(actual).toBe(false)
  })

  it('skips a match whose payment request already went out', () => {
    const actual = shouldApplyDefaultPitchCost(
      {
        status: MatchStatus.Scheduled,
        startsAt: new Date('2026-10-26T18:00:00.000Z'),
        feesNotifiedAt: new Date('2026-10-24T18:00:00.000Z'),
      },
      now,
    )

    expect(actual).toBe(false)
  })
})
