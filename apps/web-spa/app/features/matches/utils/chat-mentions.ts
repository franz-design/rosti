/** react-mentions default markup: @[Display Name](userId) */
const MENTION_MARKUP_RE = /@\[([^\]]+)\]\(([^)]+)\)/g

export function toPlainMentionBody(markup: string): string {
  return markup.replace(MENTION_MARKUP_RE, '@$1')
}

export function extractMentionIds(markup: string): string[] {
  return [...new Set([...markup.matchAll(MENTION_MARKUP_RE)].map((match) => match[2]))]
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function splitMentionedBody(
  body: string,
  mentionedNames: string[],
): Array<{ type: 'text' | 'mention'; value: string }> {
  const uniqueNames = [...new Set(mentionedNames.filter(Boolean))].sort(
    (left, right) => right.length - left.length,
  )
  if (uniqueNames.length === 0) return [{ type: 'text', value: body }]

  const pattern = new RegExp(`@(${uniqueNames.map(escapeRegExp).join('|')})`, 'g')
  const parts: Array<{ type: 'text' | 'mention'; value: string }> = []
  let lastIndex = 0

  for (const match of body.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > lastIndex) {
      parts.push({ type: 'text', value: body.slice(lastIndex, start) })
    }
    parts.push({ type: 'mention', value: match[0] })
    lastIndex = start + match[0].length
  }

  if (lastIndex < body.length) {
    parts.push({ type: 'text', value: body.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: body }]
}
