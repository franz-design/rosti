import { describe, expect, it } from 'vitest'
import en from '../../../lib/i18n/locales/en/common.locales.en.json'
import fr from '../../../lib/i18n/locales/fr/common.locales.fr.json'

const expectedKeys = {
  football: [
    'defense',
    'attack',
    'passing',
    'shooting',
    'vision',
    'endurance',
    'physical',
    'goalkeeping',
  ],
  futsal: [
    'defense',
    'attack',
    'passing',
    'shooting',
    'vision',
    'endurance',
    'physical',
    'goalkeeping',
  ],
  basketball: [
    'shooting',
    'passing',
    'dribbling',
    'defense',
    'rebounding',
    'speed',
    'vision',
    'physical',
  ],
  volleyball: [
    'serve',
    'reception',
    'setting',
    'attack',
    'block',
    'defense',
    'positioning',
    'reading',
  ],
  tennis: [
    'serve',
    'forehand',
    'backhand',
    'volley',
    'smash',
    'footwork',
    'endurance',
    'consistency',
  ],
  padel: ['serve', 'forehand', 'backhand', 'volley', 'smash', 'bandeja', 'defense', 'walls'],
  badminton: ['serve', 'clear', 'drop', 'smash', 'netPlay', 'defense', 'footwork', 'endurance'],
} as const

describe('player skill labels', () => {
  it('translates every skill in French and English', () => {
    for (const sport of Object.keys(expectedKeys) as Array<keyof typeof expectedKeys>) {
      expect(Object.keys(en.playerSkills.sports[sport])).toEqual([...expectedKeys[sport]])
      expect(Object.keys(fr.playerSkills.sports[sport])).toEqual([...expectedKeys[sport]])
    }
    expect(en.playerSkills.sports).not.toHaveProperty('other')
    expect(fr.playerSkills.sports).not.toHaveProperty('other')
  })
})
