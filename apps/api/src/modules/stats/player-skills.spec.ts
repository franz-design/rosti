import { describe, expect, it } from 'vitest'
import { SportType } from '../auth/entities/organization.entity'
import { buildSkillRatings, skillKeysForSport } from './player-skills'

describe('skillKeysForSport', () => {
  it('uses the same skills for football and futsal', () => {
    expect(skillKeysForSport(SportType.Football)).toEqual([
      'defense',
      'attack',
      'passing',
      'shooting',
      'vision',
      'endurance',
      'physical',
      'goalkeeping',
    ])
    expect(skillKeysForSport(SportType.Futsal)).toEqual(skillKeysForSport(SportType.Football))
  })

  it('lists a fixed set for each other rated sport', () => {
    expect(skillKeysForSport(SportType.Basketball)).toEqual([
      'shooting',
      'passing',
      'dribbling',
      'defense',
      'rebounding',
      'speed',
      'vision',
      'physical',
    ])
    expect(skillKeysForSport(SportType.Volleyball)).toEqual([
      'serve',
      'reception',
      'setting',
      'attack',
      'block',
      'defense',
      'positioning',
      'reading',
    ])
    expect(skillKeysForSport(SportType.Tennis)).toEqual([
      'serve',
      'forehand',
      'backhand',
      'volley',
      'smash',
      'footwork',
      'endurance',
      'consistency',
    ])
    expect(skillKeysForSport(SportType.Padel)).toEqual([
      'serve',
      'forehand',
      'backhand',
      'volley',
      'smash',
      'bandeja',
      'defense',
      'walls',
    ])
    expect(skillKeysForSport(SportType.Badminton)).toEqual([
      'serve',
      'clear',
      'drop',
      'smash',
      'netPlay',
      'defense',
      'footwork',
      'endurance',
    ])
  })

  it('has no skills for an unknown sport', () => {
    expect(skillKeysForSport(SportType.Other)).toBeNull()
    expect(skillKeysForSport(null)).toBeNull()
    expect(skillKeysForSport(undefined)).toBeNull()
  })
})

describe('buildSkillRatings', () => {
  it('fills missing skills with zero and keeps stored values', () => {
    const actual = buildSkillRatings(SportType.Tennis, [
      { skill: 'serve', value: 8 },
      { skill: 'goalkeeping', value: 10 },
    ])

    expect(actual).toEqual({
      sportType: SportType.Tennis,
      skills: [
        { key: 'serve', value: 8 },
        { key: 'forehand', value: 0 },
        { key: 'backhand', value: 0 },
        { key: 'volley', value: 0 },
        { key: 'smash', value: 0 },
        { key: 'footwork', value: 0 },
        { key: 'endurance', value: 0 },
        { key: 'consistency', value: 0 },
      ],
    })
  })

  it('clamps a stored value into the 0 to 10 range', () => {
    const actual = buildSkillRatings(SportType.Football, [
      { skill: 'defense', value: 14 },
      { skill: 'attack', value: -2 },
      { skill: 'passing', value: 6.6 },
    ])

    expect(actual?.skills.find((skill) => skill.key === 'defense')?.value).toBe(10)
    expect(actual?.skills.find((skill) => skill.key === 'attack')?.value).toBe(0)
    expect(actual?.skills.find((skill) => skill.key === 'passing')?.value).toBe(7)
  })

  it('returns nothing when the sport has no skills', () => {
    expect(buildSkillRatings(SportType.Other, [{ skill: 'defense', value: 4 }])).toBeNull()
  })
})
