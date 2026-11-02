import { describe, expect, it } from 'vitest'
import { buildMatchShareText } from './build-match-share-text'

describe('buildMatchShareText', () => {
  it('builds a multi-line summary with capacity and url', () => {
    const actual = buildMatchShareText({
      title: 'Match du mardi',
      dateLabel: 'mardi 4 novembre 2026',
      timeLabel: '20:30',
      location: 'Terrain Nord',
      capacityLabel: '8 / 12 joueurs',
      url: 'https://rosti.lesk.fr/matches/abc',
    })

    expect(actual).toBe(
      [
        'Match du mardi',
        'mardi 4 novembre 2026 · 20:30',
        'Terrain Nord',
        '8 / 12 joueurs',
        'https://rosti.lesk.fr/matches/abc',
      ].join('\n'),
    )
  })

  it('skips blank location lines', () => {
    const actual = buildMatchShareText({
      title: 'Wednesday match',
      dateLabel: 'Wednesday 4 November 2026',
      timeLabel: '20:30',
      location: '   ',
      capacityLabel: '8 / 12 players',
      url: 'https://example.com/matches/abc',
    })

    expect(actual).toBe(
      [
        'Wednesday match',
        'Wednesday 4 November 2026 · 20:30',
        '8 / 12 players',
        'https://example.com/matches/abc',
      ].join('\n'),
    )
  })
})
