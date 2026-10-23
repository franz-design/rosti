import { AppLoader } from '@rosti/ui/components/app'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Navigate } from 'react-router'
import { acceptPendingInvitations } from '@/features/auth/utils/pending-invitation'
import {
  clearClubChoiceRequired,
  isClubChoiceRequired,
  readStoredClubId,
  storeActiveClubId,
} from '@/features/clubs/utils/club-session'
import {
  decideClubDestination,
  resolveActiveClubId,
} from '@/features/clubs/utils/decide-club-destination'
import { authClient } from '@/lib/auth-client'
import { rostiApi } from '@/lib/rosti-api'

export default function HomeRedirect() {
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  const { data, isLoading: isClubsLoading } = useQuery({
    queryKey: ['clubs', session?.user?.id, 'gate'],
    queryFn: async () => {
      const acceptedOrganizationId = await acceptPendingInvitations()
      const clubs = await rostiApi.listClubs()
      return { clubs, acceptedOrganizationId }
    },
    enabled: !!session?.user,
  })

  const destination = data
    ? decideClubDestination({
        clubIds: data.clubs.map((club) => club.id),
        acceptedOrganizationId: data.acceptedOrganizationId,
        justSignedIn: isClubChoiceRequired(),
        storedClubId: readStoredClubId(),
      })
    : null

  useEffect(() => {
    if (!data || !destination || destination === '/choose-club') return
    clearClubChoiceRequired()
    if (destination !== '/dashboard') return
    const clubId = resolveActiveClubId({
      clubIds: data.clubs.map((club) => club.id),
      acceptedOrganizationId: data.acceptedOrganizationId,
      storedClubId: readStoredClubId(),
    })
    if (!clubId) return
    storeActiveClubId(clubId)
    void authClient.organization.setActive({ organizationId: clubId })
  }, [data, destination])

  if (isSessionPending) return <AppLoader />
  if (!session) return <Navigate to="/login" replace />
  if (isClubsLoading || !destination) return <AppLoader />
  return <Navigate to={destination} replace />
}
