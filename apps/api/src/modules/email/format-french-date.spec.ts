import { formatFrenchDate } from './format-french-date'

describe('formatFrenchDate', () => {
  it('drops the minutes when the time is on the hour', () => {
    const actual = formatFrenchDate(new Date('2026-11-23T10:00:00.000Z'))

    expect(actual).toBe('lundi 23 novembre à 11h')
  })

  it('keeps the minutes when the time is not on the hour', () => {
    const actual = formatFrenchDate(new Date('2026-07-15T08:05:00.000Z'))

    expect(actual).toBe('mercredi 15 juillet à 10h05')
  })
})
