import { describe, expect, it } from 'vitest'
import { emptyBallKindForSport } from './ball-by-sport'

describe('emptyBallKindForSport', () => {
  it('keeps the football ball for football and futsal', () => {
    expect(emptyBallKindForSport('football')).toBe('football')
    expect(emptyBallKindForSport('futsal')).toBe('football')
  })

  it('keeps the football ball when the sport is missing or other', () => {
    expect(emptyBallKindForSport('other')).toBe('football')
    expect(emptyBallKindForSport(null)).toBe('football')
    expect(emptyBallKindForSport(undefined)).toBe('football')
  })

  it('picks the ball that matches the sport', () => {
    expect(emptyBallKindForSport('basketball')).toBe('basketball')
    expect(emptyBallKindForSport('volleyball')).toBe('volleyball')
    expect(emptyBallKindForSport('tennis')).toBe('tennis')
    expect(emptyBallKindForSport('padel')).toBe('padel')
    expect(emptyBallKindForSport('badminton')).toBe('badminton')
  })
})
