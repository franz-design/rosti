import { MatchStatus } from './contracts/match.contract'
import {
  computePlayerVoteClosesAt,
  hasEveryoneVoted,
  isPlayerVoteReady,
  MIN_PLAYER_VOTE_PLAYERS,
  pickLatestMatch,
  pickOpenPlayerVoteMatchId,
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

describe('pickOpenPlayerVoteMatchId', () => {
  const now = new Date('2026-10-10T12:00:00.000Z')
  const latest = {
    id: 'latest',
    startsAt: new Date('2026-10-09T18:00:00.000Z'),
    playerVoteOpenedAt: new Date('2026-10-09T20:00:00.000Z'),
    playerVoteClosedAt: null,
    playerVoteClosesAt: new Date('2026-10-11T20:00:00.000Z'),
  }

  it('returns the latest match while its vote is open', () => {
    expect(pickOpenPlayerVoteMatchId([latest], now)).toBe('latest')
  })

  it('ignores an older open vote once the latest match is closed', () => {
    const older = {
      ...latest,
      id: 'older',
      startsAt: new Date('2026-10-02T18:00:00.000Z'),
    }
    const closed = {
      ...latest,
      playerVoteClosedAt: new Date('2026-10-10T08:00:00.000Z'),
    }

    expect(pickOpenPlayerVoteMatchId([older, closed], now)).toBeNull()
  })

  it('hides the prompt once the voting window has ended', () => {
    const expired = {
      ...latest,
      playerVoteClosesAt: new Date('2026-10-10T11:00:00.000Z'),
    }

    expect(pickOpenPlayerVoteMatchId([expired], now)).toBeNull()
  })

  it('hides the prompt when the vote has not opened', () => {
    expect(pickOpenPlayerVoteMatchId([{ ...latest, playerVoteOpenedAt: null }], now)).toBeNull()
  })
})

describe('pickLatestMatch', () => {
  it('keeps the match with the latest kickoff', () => {
    const earlier = { id: 'b', startsAt: new Date('2026-10-01T18:00:00.000Z') }
    const later = { id: 'a', startsAt: new Date('2026-10-08T18:00:00.000Z') }

    expect(pickLatestMatch([earlier, later])?.id).toBe('a')
  })
})
