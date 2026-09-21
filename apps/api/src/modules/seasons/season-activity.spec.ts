import { describe, expect, it } from 'vitest'
import { SeasonStatus } from './contracts/season.contract'
import { dayBeforeUtc, isEndBeforeStart, windowAfterClose } from './season-activity'

describe('dayBeforeUtc', () => {
  it('returns the previous calendar day in UTC', () => {
    const actual = dayBeforeUtc(new Date('2026-09-01T00:00:00.000Z'))

    expect(actual.toISOString()).toBe('2026-08-31T00:00:00.000Z')
  })
})

describe('isEndBeforeStart', () => {
  it('accepts a missing end date', () => {
    expect(isEndBeforeStart(new Date('2026-09-01T00:00:00.000Z'), null)).toBe(false)
  })

  it('accepts an end date on the start day', () => {
    const inputDay = new Date('2026-09-01T00:00:00.000Z')

    expect(isEndBeforeStart(inputDay, inputDay)).toBe(false)
  })

  it('rejects an end date before the start', () => {
    expect(
      isEndBeforeStart(new Date('2026-09-01T00:00:00.000Z'), new Date('2026-08-31T00:00:00.000Z')),
    ).toBe(true)
  })
})

describe('windowAfterClose', () => {
  const inputClosedOn = new Date('2026-08-31T00:00:00.000Z')

  it('keeps an end date that was already set', () => {
    const actual = windowAfterClose(
      {
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        endsAt: new Date('2026-06-30T00:00:00.000Z'),
      },
      inputClosedOn,
    )

    expect(actual).toEqual({
      status: SeasonStatus.Closed,
      endsAt: new Date('2026-06-30T00:00:00.000Z'),
    })
  })

  it('sets the end date to the day before the next season', () => {
    const actual = windowAfterClose(
      { startsAt: new Date('2026-01-01T00:00:00.000Z'), endsAt: null },
      inputClosedOn,
    )

    expect(actual).toEqual({
      status: SeasonStatus.Closed,
      endsAt: inputClosedOn,
    })
  })

  it('leaves the end date empty when the next season starts earlier', () => {
    const actual = windowAfterClose(
      { startsAt: new Date('2026-10-01T00:00:00.000Z'), endsAt: null },
      inputClosedOn,
    )

    expect(actual).toEqual({ status: SeasonStatus.Closed })
  })
})
