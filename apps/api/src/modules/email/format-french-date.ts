const PARIS_TIME_ZONE = 'Europe/Paris'

/**
 * Writes a date the way someone would say it, in Paris time.
 * Example: "lundi 23 novembre à 11h" or "lundi 23 novembre à 11h30".
 */
export function formatFrenchDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? ''

  const minute = read('minute')
  const time = minute === '00' ? `${read('hour')}h` : `${read('hour')}h${minute}`

  return `${read('weekday')} ${read('day')} ${read('month')} à ${time}`
}
