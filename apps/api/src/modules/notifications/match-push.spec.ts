import { describe, expect, it } from 'vitest'
import {
  matchInvitePush,
  playerVoteOpenedPush,
  playerVoteResultPush,
  rsvpReminderPush,
  scoreReminderPush,
} from './match-push'

const MATCH = {
  organizationId: '11111111-1111-4111-8111-111111111111',
  matchId: '22222222-2222-4222-8222-222222222222',
  matchTitle: 'Match du jeudi',
}

const MATCH_URL = `/matches/${MATCH.matchId}?organizationId=${MATCH.organizationId}`

describe('match pushes', () => {
  it('asks every player to register', () => {
    expect(matchInvitePush(MATCH)).toEqual({
      title: 'Inscription : Match du jeudi',
      body: 'Dis si tu viens.',
      event: 'match_invite',
      organizationId: MATCH.organizationId,
      matchId: MATCH.matchId,
      url: MATCH_URL,
    })
  })

  it('reminds players who have not answered', () => {
    expect(rsvpReminderPush(MATCH)).toMatchObject({
      title: 'Rappel : Match du jeudi',
      body: "Tu n'as pas encore répondu.",
      event: 'rsvp_reminder',
      url: MATCH_URL,
    })
  })

  it('asks an admin to enter the score', () => {
    expect(scoreReminderPush(MATCH)).toMatchObject({
      title: 'Score à saisir',
      body: 'Match du jeudi',
      event: 'score_reminder',
    })
  })

  it('asks the players who were there to vote', () => {
    expect(playerVoteOpenedPush(MATCH)).toMatchObject({
      title: 'Meilleur joueur',
      body: 'Vote pour Match du jeudi. Tu as 2 jours.',
      event: 'player_vote_opened',
    })
  })

  it('tells the players who was elected', () => {
    expect(
      playerVoteResultPush({ ...MATCH, winnerName: 'Hugo Bernard', isTie: false }),
    ).toMatchObject({
      title: 'Meilleur joueur',
      body: 'Hugo Bernard est élu.',
      event: 'player_vote_result',
    })
  })

  it('tells the players when the vote is a tie', () => {
    expect(playerVoteResultPush({ ...MATCH, winnerName: null, isTie: true })).toMatchObject({
      title: 'Égalité',
      body: "Personne n'est élu pour Match du jeudi.",
      event: 'player_vote_result',
    })
  })

  it('keeps a long title on one short line', () => {
    const actual = matchInvitePush({
      ...MATCH,
      matchTitle: `  Match\n${'a'.repeat(120)}`,
    })

    expect(actual.title.startsWith('Inscription : Match ')).toBe(true)
    expect(actual.title).toHaveLength(80)
    expect(actual.title.includes('\n')).toBe(false)
  })
})
