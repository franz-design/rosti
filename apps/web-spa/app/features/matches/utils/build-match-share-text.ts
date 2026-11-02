export interface MatchShareTextParts {
  title: string
  dateLabel: string
  timeLabel: string
  location?: string | null
  capacityLabel: string
  url: string
}

/** Builds the plain-text body copied or sent when sharing a match. */
export function buildMatchShareText(parts: MatchShareTextParts): string {
  const lines = [parts.title, `${parts.dateLabel} · ${parts.timeLabel}`]
  const location = parts.location?.trim()
  if (location) lines.push(location)
  lines.push(parts.capacityLabel, parts.url)
  return lines.join('\n')
}
