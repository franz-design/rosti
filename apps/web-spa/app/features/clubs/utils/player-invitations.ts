export interface ClubInvitation {
  id: string
  email: string
  role: string
  status: string
  organizationId: string
  expiresAt: string | Date
  createdAt?: string | Date
}

/**
 * Pending invitations still worth a row in the player list.
 * A member already covers that email. Several pending invites for one email collapse to the latest.
 */
export function selectPendingInvitations(input: {
  invitations: ClubInvitation[]
  memberEmails: readonly string[]
}): ClubInvitation[] {
  const memberEmails = new Set(input.memberEmails.map(normalizeEmail))
  const newestByEmail = new Map<string, ClubInvitation>()

  for (const invitation of input.invitations) {
    if (invitation.status !== 'pending') continue
    const email = normalizeEmail(invitation.email)
    if (memberEmails.has(email)) continue

    const current = newestByEmail.get(email)
    if (!current || isNewerInvitation(invitation, current)) {
      newestByEmail.set(email, invitation)
    }
  }

  return [...newestByEmail.values()]
}

/**
 * Other pending invitations for the same address, once one invite has been kept.
 */
export function findStaleInvitationIds(input: {
  invitations: ClubInvitation[]
  email: string
  keptId: string
}): string[] {
  const email = normalizeEmail(input.email)
  return input.invitations
    .filter((invitation) => invitation.status === 'pending')
    .filter((invitation) => normalizeEmail(invitation.email) === email)
    .filter((invitation) => invitation.id !== input.keptId)
    .map((invitation) => invitation.id)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isNewerInvitation(candidate: ClubInvitation, current: ClubInvitation): boolean {
  const candidateTime = invitationRecency(candidate)
  const currentTime = invitationRecency(current)
  if (candidateTime !== currentTime) return candidateTime > currentTime
  return candidate.id > current.id
}

function invitationRecency(invitation: ClubInvitation): number {
  return toTime(invitation.createdAt) ?? toTime(invitation.expiresAt) ?? 0
}

function toTime(value: string | Date | undefined): number | null {
  if (!value) return null
  const time = value instanceof Date ? value.getTime() : Date.parse(value)
  if (Number.isNaN(time)) return null
  return time
}
