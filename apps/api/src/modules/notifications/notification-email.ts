import { joinAppUrl } from '../email/email-layout'
import { formatFrenchDate } from '../email/format-french-date'

export interface MatchEmailSource {
  id: string
  title: string
  startsAt: Date
  location?: string | null
}

export interface NotificationEmailCopy {
  subject: string
  paragraphs: string[]
  action: { label: string; url: string }
}

export function newMatchEmail(match: MatchEmailSource, appUrl: string): NotificationEmailCopy {
  return {
    subject: oneLine(`Nouveau match : ${match.title}`),
    paragraphs: [
      `Un nouveau match est prévu ${whenAndWhere(match)}.`,
      'Dis si tu viens.',
    ],
    action: { label: 'Voir le match', url: matchUrl(appUrl, match.id) },
  }
}

export function cancelledMatchEmail(
  match: MatchEmailSource,
  appUrl: string,
  reason?: string | null,
): NotificationEmailCopy {
  const detail = reason?.trim()
  const paragraphs = [`Le match du ${whenAndWhere(match)} est annulé.`]
  if (detail) paragraphs.push(detail)
  return {
    subject: oneLine(`Match annulé : ${match.title}`),
    paragraphs,
    action: { label: 'Voir le match', url: matchUrl(appUrl, match.id) },
  }
}

export function rsvpReminderEmail(match: MatchEmailSource, appUrl: string): NotificationEmailCopy {
  return {
    subject: oneLine(`Tu confirmes pour ${match.title} ?`),
    paragraphs: [`Le match a lieu ${whenAndWhere(match)}. Dis si tu seras là.`],
    action: { label: 'Répondre', url: matchUrl(appUrl, match.id) },
  }
}

export function scoreReminderEmail(match: MatchEmailSource, appUrl: string): NotificationEmailCopy {
  return {
    subject: oneLine(`Le score de ${match.title}`),
    paragraphs: [
      `Le match ${whenAndWhere(match)} est terminé.`,
      'Indique le score dans Rösti.',
    ],
    action: { label: 'Saisir le score', url: matchUrl(appUrl, match.id) },
  }
}

export function chatMentionEmail(input: {
  appUrl: string
  matchId: string
  matchTitle: string
  authorName: string
  body: string
}): NotificationEmailCopy {
  return chatEmail({
    ...input,
    subject: oneLine(`${input.authorName} te mentionne`),
    intro: `Dans ${input.matchTitle}.`,
  })
}

export function chatMessageEmail(input: {
  appUrl: string
  matchId: string
  matchTitle: string
  authorName: string
  body: string
}): NotificationEmailCopy {
  return chatEmail({
    ...input,
    subject: oneLine(`Nouveau message dans ${input.matchTitle}`),
    intro: `${input.authorName} a écrit dans ${input.matchTitle}.`,
  })
}

function chatEmail(input: {
  appUrl: string
  matchId: string
  subject: string
  intro: string
  body: string
}): NotificationEmailCopy {
  const paragraphs = [input.intro]
  const body = input.body.trim()
  if (body) paragraphs.push(body)
  return {
    subject: input.subject,
    paragraphs,
    action: { label: 'Voir le message', url: matchUrl(input.appUrl, input.matchId) },
  }
}

function whenAndWhere(match: MatchEmailSource): string {
  const when = formatFrenchDate(match.startsAt)
  const place = match.location?.trim()
  return place ? `${when} à ${place}` : when
}

function matchUrl(appUrl: string, matchId: string): string {
  return joinAppUrl(appUrl, `/matches/${matchId}`)
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}
