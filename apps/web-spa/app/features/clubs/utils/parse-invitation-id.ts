const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i

export function parseInvitationId(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const fromPath = url.pathname.match(/\/invite\/([^/?#]+)/i)
    if (fromPath?.[1] && UUID_RE.test(fromPath[1])) return fromPath[1]
    const token = url.searchParams.get('invitationId') ?? url.searchParams.get('token')
    if (token && UUID_RE.test(token)) return token
  } catch {
    // not a URL — try raw UUID or path fragment
  }

  const pathMatch = trimmed.match(/\/invite\/([^/?#]+)/i)
  if (pathMatch?.[1] && UUID_RE.test(pathMatch[1])) return pathMatch[1]

  const uuidMatch = trimmed.match(UUID_RE)
  return uuidMatch?.[0] ?? null
}
