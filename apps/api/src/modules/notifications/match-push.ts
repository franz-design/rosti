import type { AppPushPayload } from './app-push'

const MAX_TITLE_LENGTH = 80
const MAX_BODY_LENGTH = 140

export interface MatchPushSource {
  organizationId: string
  matchId: string
  matchTitle: string
}

export function matchInvitePush(match: MatchPushSource): AppPushPayload {
  return buildMatchPush(match, {
    event: 'match_invite',
    title: `Inscription : ${match.matchTitle}`,
    body: 'Dis si tu viens.',
  })
}

export function rsvpReminderPush(match: MatchPushSource): AppPushPayload {
  return buildMatchPush(match, {
    event: 'rsvp_reminder',
    title: `Rappel : ${match.matchTitle}`,
    body: "Tu n'as pas encore répondu.",
  })
}

export function scoreReminderPush(match: MatchPushSource): AppPushPayload {
  return buildMatchPush(match, {
    event: 'score_reminder',
    title: 'Score à saisir',
    body: match.matchTitle,
  })
}

export function playerVoteOpenedPush(match: MatchPushSource): AppPushPayload {
  return buildMatchPush(match, {
    event: 'player_vote_opened',
    title: 'Meilleur joueur',
    body: `Vote pour ${match.matchTitle}. Tu as 2 jours.`,
  })
}

export function playerVoteResultPush(
  match: MatchPushSource & { winnerName: string | null; isTie: boolean },
): AppPushPayload {
  if (match.isTie) {
    return buildMatchPush(match, {
      event: 'player_vote_result',
      title: 'Égalité',
      body: `Personne n'est élu pour ${match.matchTitle}.`,
    })
  }
  if (match.winnerName) {
    return buildMatchPush(match, {
      event: 'player_vote_result',
      title: 'Meilleur joueur',
      body: `${match.winnerName} est élu.`,
    })
  }
  return buildMatchPush(match, {
    event: 'player_vote_result',
    title: 'Vote terminé',
    body: `Aucun joueur élu pour ${match.matchTitle}.`,
  })
}

function buildMatchPush(
  match: MatchPushSource,
  copy: { event: AppPushPayload['event']; title: string; body: string },
): AppPushPayload {
  return {
    title: clip(copy.title, MAX_TITLE_LENGTH),
    body: clip(copy.body, MAX_BODY_LENGTH),
    event: copy.event,
    organizationId: match.organizationId,
    matchId: match.matchId,
    url: `/matches/${match.matchId}?organizationId=${match.organizationId}`,
  }
}

function clip(value: string, maxLength: number): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}
