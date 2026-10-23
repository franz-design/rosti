export type ClubEntryPath = '/onboarding' | '/choose-club' | '/dashboard'

interface ClubEntryInput {
  clubIds: string[]
  acceptedOrganizationId: string | null
  justSignedIn: boolean
  storedClubId: string | null
}

/**
 * Where to send someone after sign-in, or when they open the app already signed in.
 * A freshly accepted invitation wins. Otherwise a single club opens directly.
 * Several clubs ask for a choice on sign-in, or when the remembered club is gone.
 */
export function decideClubDestination(input: ClubEntryInput): ClubEntryPath {
  if (acceptedClubId(input.clubIds, input.acceptedOrganizationId)) return '/dashboard'
  if (input.clubIds.length === 0) return '/onboarding'
  if (input.clubIds.length === 1) return '/dashboard'
  if (input.justSignedIn) return '/choose-club'
  if (input.storedClubId && input.clubIds.includes(input.storedClubId)) return '/dashboard'
  return '/choose-club'
}

export function resolveActiveClubId(input: Omit<ClubEntryInput, 'justSignedIn'>): string | null {
  return (
    acceptedClubId(input.clubIds, input.acceptedOrganizationId) ??
    (input.clubIds.length === 1 ? input.clubIds[0] : null) ??
    (input.storedClubId && input.clubIds.includes(input.storedClubId) ? input.storedClubId : null)
  )
}

function acceptedClubId(clubIds: string[], acceptedOrganizationId: string | null): string | null {
  if (!acceptedOrganizationId || !clubIds.includes(acceptedOrganizationId)) return null
  return acceptedOrganizationId
}
