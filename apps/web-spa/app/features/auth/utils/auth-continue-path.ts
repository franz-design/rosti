const CONTINUED_PARAMS = ['invitationId', 'email', 'club'] as const

export function authPath(pathname: string, searchParams: URLSearchParams): string {
  const next = new URLSearchParams()
  const invitationId = searchParams.get('invitationId') ?? searchParams.get('invite')

  if (invitationId) next.set('invitationId', invitationId)
  for (const key of CONTINUED_PARAMS) {
    if (key === 'invitationId') continue
    const value = searchParams.get(key)
    if (value) next.set(key, value)
  }

  const query = next.toString()
  return query ? `${pathname}?${query}` : pathname
}
