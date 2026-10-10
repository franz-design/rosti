import { describe, expect, it } from 'vitest'
import { selectHomeAwardSlots, type HomeAwardClub } from './home-award-slots'

const LUCAS = { userId: 'lucas', userName: 'Lucas', image: null, value: 4 }
const HUGO = { userId: 'hugo', userName: 'Hugo', image: null, value: 3 }
const ADAM = { userId: 'adam', userName: 'Adam', image: null, value: 2 }
const MATCH_ID = '11111111-1111-4111-8111-111111111111'

function club(overrides: Partial<HomeAwardClub> = {}): HomeAwardClub {
  return {
    matchesPlayed: 0,
    topScorer: null,
    mostWins: null,
    mostLosses: null,
    lastElectedPlayer: null,
    openPlayerVoteMatchId: null,
    mostPlayedTogether: null,
    ...overrides,
  }
}

describe('selectHomeAwardSlots', () => {
  it('shows nothing when no award has a player', () => {
    expect(selectHomeAwardSlots(club())).toEqual([])
  })

  it('shows a single season record when it is the only one', () => {
    expect(selectHomeAwardSlots(club({ matchesPlayed: 1, topScorer: LUCAS }))).toEqual([
      { kind: 'record', variant: 'scorer', player: LUCAS },
    ])
  })

  it('rotates two season records as matches are played', () => {
    const season = club({
      topScorer: LUCAS,
      mostWins: HUGO,
      mostLosses: ADAM,
    })

    expect(selectHomeAwardSlots({ ...season, matchesPlayed: 5 }).map(slotLabel)).toEqual([
      'losses',
      'scorer',
    ])
    expect(selectHomeAwardSlots({ ...season, matchesPlayed: 6 }).map(slotLabel)).toEqual([
      'scorer',
      'wins',
    ])
    expect(selectHomeAwardSlots({ ...season, matchesPlayed: 7 }).map(slotLabel)).toEqual([
      'wins',
      'losses',
    ])
  })

  it('rotates the teammate duo with the other season records', () => {
    const duo = {
      playerA: { userId: LUCAS.userId, userName: LUCAS.userName, image: null },
      playerB: { userId: HUGO.userId, userName: HUGO.userName, image: null },
      matchesTogether: 4,
    }
    const season = club({
      topScorer: LUCAS,
      mostWins: HUGO,
      mostLosses: ADAM,
      mostPlayedTogether: duo,
    })

    expect(selectHomeAwardSlots({ ...season, matchesPlayed: 6 }).map(slotLabel)).toEqual([
      'losses',
      'duo',
    ])
    expect(selectHomeAwardSlots(club({ matchesPlayed: 2, mostPlayedTogether: duo }))).toEqual([
      { kind: 'duo', ...duo },
    ])
  })

  it('keeps the elected player in the first slot and rotates a different season record', () => {
    const actual = selectHomeAwardSlots(
      club({
        matchesPlayed: 6,
        topScorer: LUCAS,
        mostWins: HUGO,
        mostLosses: ADAM,
        lastElectedPlayer: { userId: LUCAS.userId, userName: LUCAS.userName, image: null },
      }),
    )

    expect(actual.map(slotLabel)).toEqual(['elected', 'wins'])
  })

  it('still shows one season record when every record belongs to the elected player', () => {
    const actual = selectHomeAwardSlots(
      club({
        matchesPlayed: 5,
        topScorer: LUCAS,
        mostWins: { ...LUCAS, value: 2 },
        mostLosses: { ...LUCAS, value: 1 },
        lastElectedPlayer: { userId: LUCAS.userId, userName: LUCAS.userName, image: null },
      }),
    )

    expect(actual.map(slotLabel)).toEqual(['elected', 'losses'])
  })

  it('fills the elected slot with a vote prompt while the last match vote is open', () => {
    const actual = selectHomeAwardSlots(
      club({
        matchesPlayed: 5,
        topScorer: LUCAS,
        mostWins: HUGO,
        mostLosses: ADAM,
        openPlayerVoteMatchId: MATCH_ID,
      }),
    )

    expect(actual.map(slotLabel)).toEqual(['vote', 'losses'])
    expect(actual[0]).toEqual({ kind: 'vote', matchId: MATCH_ID })
  })

  it('shows only the vote prompt when the season has no record yet', () => {
    expect(
      selectHomeAwardSlots(club({ matchesPlayed: 1, openPlayerVoteMatchId: MATCH_ID })),
    ).toEqual([{ kind: 'vote', matchId: MATCH_ID }])
  })

  it('prefers the elected player when a winner and an open vote are both present', () => {
    const actual = selectHomeAwardSlots(
      club({
        matchesPlayed: 2,
        lastElectedPlayer: { userId: HUGO.userId, userName: HUGO.userName, image: null },
        openPlayerVoteMatchId: MATCH_ID,
      }),
    )

    expect(actual).toEqual([
      {
        kind: 'elected',
        player: { userId: HUGO.userId, userName: HUGO.userName, image: null, value: 0 },
      },
    ])
  })
})

function slotLabel(slot: ReturnType<typeof selectHomeAwardSlots>[number]): string {
  if (slot.kind === 'record') return slot.variant
  return slot.kind
}
