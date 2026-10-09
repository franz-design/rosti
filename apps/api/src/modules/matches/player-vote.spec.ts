import { MatchStatus } from './contracts/match.contract'
import {
  computePlayerVoteClosesAt,
  hasEveryoneVoted,
  isPlayerVoteReady,
  MIN_PLAYER_VOTE_PLAYERS,
  pickLatestMatch,
  PLAYER_VOTE_WINDOW_MS,
  resolvePlayerVote,
} from './player-vote'

const LUCAS = { userId: 'lucas', userName: 'Lucas Martin', image: null }
const HUGO = { userId: 'hugo', userName: 'Hugo Bernard', image: 'https://example.com/hugo.png' }
const ADAM = { userId: 'adam', userName: 'Adam Petit', image: null }

describe('isPlayerVoteReady', () => {
  it('is ready when the match is finished and both scores are set', () => {
    expect(isPlayerVoteReady({ status: MatchStatus.Played, blueScore: 0, redScore: 0 })).toBe(true)
  })

  it('waits while the score or the finished status is missing', () => {
    expect(isPlayerVoteReady({ status: MatchStatus.Scheduled, blueScore: 2, redScore: 1 })).toBe(
      false,
    )
    expect(isPlayerVoteReady({ status: MatchStatus.Played, blueScore: 2, redScore: null })).toBe(
      false,
    )
  })
})

describe('computePlayerVoteClosesAt', () => {
  it('closes two days after the vote opens', () => {
    const openedAt = new Date('2026-10-09T15:00:00.000Z')

    expect(computePlayerVoteClosesAt(openedAt).getTime() - openedAt.getTime()).toBe(
      PLAYER_VOTE_WINDOW_MS,
    )
    expect(MIN_PLAYER_VOTE_PLAYERS).toBe(2)
  })
})

describe('resolvePlayerVote', () => {
  const presentPlayers = [LUCAS, HUGO, ADAM]

  it('elects the player with the most votes', () => {
    const actual = resolvePlayerVote({
      presentPlayers,
      ballots: [
        { voterUserId: LUCAS.userId, nomineeUserId: HUGO.userId },
        { voterUserId: ADAM.userId, nomineeUserId: HUGO.userId },
        { voterUserId: HUGO.userId, nomineeUserId: LUCAS.userId },
      ],
    })

    expect(actual).toEqual({
      winner: HUGO,
      isTie: false,
    })
  })

  it('elects nobody when two players share the top', () => {
    const actual = resolvePlayerVote({
      presentPlayers,
      ballots: [
        { voterUserId: LUCAS.userId, nomineeUserId: HUGO.userId },
        { voterUserId: HUGO.userId, nomineeUserId: LUCAS.userId },
      ],
    })

    expect(actual).toEqual({ winner: null, isTie: true })
  })

  it('ignores a vote for yourself or for someone who did not attend', () => {
    const actual = resolvePlayerVote({
      presentPlayers: [LUCAS, HUGO],
      ballots: [
        { voterUserId: LUCAS.userId, nomineeUserId: LUCAS.userId },
        { voterUserId: ADAM.userId, nomineeUserId: HUGO.userId },
        { voterUserId: HUGO.userId, nomineeUserId: LUCAS.userId },
      ],
    })

    expect(actual.winner).toEqual(LUCAS)
    expect(actual.isTie).toBe(false)
  })
})

describe('hasEveryoneVoted', () => {
  it('is true only when every present player has a valid ballot', () => {
    const presentUserIds = [LUCAS.userId, HUGO.userId]

    expect(
      hasEveryoneVoted({
        presentUserIds,
        ballots: [
          { voterUserId: LUCAS.userId, nomineeUserId: HUGO.userId },
          { voterUserId: HUGO.userId, nomineeUserId: LUCAS.userId },
        ],
      }),
    ).toBe(true)

    expect(
      hasEveryoneVoted({
        presentUserIds,
        ballots: [{ voterUserId: LUCAS.userId, nomineeUserId: HUGO.userId }],
      }),
    ).toBe(false)
  })

  it('does not finish early with a single present player', () => {
    expect(
      hasEveryoneVoted({
        presentUserIds: [LUCAS.userId],
        ballots: [],
      }),
    ).toBe(false)
  })
})

describe('pickLatestMatch', () => {
  it('keeps the match with the latest kickoff', () => {
    const earlier = { id: 'b', startsAt: new Date('2026-10-01T18:00:00.000Z') }
    const later = { id: 'a', startsAt: new Date('2026-10-08T18:00:00.000Z') }

    expect(pickLatestMatch([earlier, later])?.id).toBe('a')
  })
})
