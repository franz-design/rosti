import { newMatchEmail, rsvpReminderEmail } from './notification-email'

const APP_URL = 'https://app.lesk.fr'
const MATCH = {
  id: 'match-1',
  title: 'Match — FC Gros',
  startsAt: new Date('2026-11-23T10:00:00.000Z'),
  location: 'La Vertonne',
}

describe('notification emails', () => {
  it('writes a new match in everyday French', () => {
    const actual = newMatchEmail(MATCH, APP_URL)

    expect(actual.subject).toBe('Nouveau match : Match — FC Gros')
    expect(actual.paragraphs[0]).toBe(
      'Un nouveau match est prévu lundi 23 novembre à 11h à La Vertonne.',
    )
    expect(actual.action.url).toBe('https://app.lesk.fr/matches/match-1')
  })

  it('asks for a reply without a raw timestamp', () => {
    const actual = rsvpReminderEmail({ ...MATCH, location: '  ' }, APP_URL)

    expect(actual.paragraphs[0]).toBe(
      'Le match a lieu lundi 23 novembre à 11h. Est-ce que tu seras présent ?',
    )
    expect(actual.paragraphs.join(' ')).not.toContain('2026-11-23')
  })
})
