import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate, useSearchParams } from 'react-router'
import { authClient } from '@/lib/auth-client'
import { rostiApi, type Club, type ClubMember } from '@/lib/rosti-api'
import { readStoredClubId, storeActiveClubId } from '../utils/club-session'

type ClubRole = ClubMember['role']

interface ClubContextValue {
  clubs: Club[]
  activeClub: Club | null
  setActiveClubId: (id: string) => Promise<void>
  isLoading: boolean
  refetchClubs: () => void
  myMembership: ClubMember | null
  isClubAdmin: boolean
  isMembershipLoading: boolean
}

const ClubContext = createContext<ClubContextValue | null>(null)

function isAdminRole(role: ClubRole | undefined): boolean {
  return role === 'owner' || role === 'admin'
}

export function ClubProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession()
  const [searchParams] = useSearchParams()
  const [activeClubId, setActiveClubIdState] = useState<string | null>(() => readStoredClubId())

  const {
    data: clubs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['clubs', session?.user?.id],
    queryFn: () => rostiApi.listClubs(),
    enabled: !!session?.user,
  })

  const requestedClubId = searchParams.get('organizationId')
  const requestedClub = clubs.find((club) => club.id === requestedClubId) ?? null

  useEffect(() => {
    if (clubs.length !== 1) return
    const onlyId = clubs[0].id
    if (activeClubId === onlyId) return
    setActiveClubIdState(onlyId)
    storeActiveClubId(onlyId)
    void authClient.organization.setActive({ organizationId: onlyId })
  }, [clubs, activeClubId])

  const activeClub = useMemo(() => {
    if (requestedClub) return requestedClub
    const stored = clubs.find((club) => club.id === activeClubId)
    if (stored) return stored
    if (clubs.length === 1) return clubs[0]
    return null
  }, [clubs, activeClubId, requestedClub])

  useEffect(() => {
    if (!activeClub?.id) return
    void authClient.organization.setActive({ organizationId: activeClub.id })
  }, [activeClub?.id])

  useEffect(() => {
    if (!requestedClub) return
    setActiveClubIdState((current) => (current === requestedClub.id ? current : requestedClub.id))
    storeActiveClubId(requestedClub.id)
    void authClient.organization.setActive({ organizationId: requestedClub.id })
  }, [requestedClub])

  const { data: members = [], isLoading: isMembershipLoading } = useQuery({
    queryKey: ['club-members', activeClub?.id, session?.user?.id],
    queryFn: () => rostiApi.listMembers(activeClub!.id),
    enabled: !!activeClub && !!session?.user,
  })

  const myMembership = useMemo(
    () => members.find((member) => member.userId === session?.user?.id) ?? null,
    [members, session?.user?.id],
  )

  const isClubAdmin = isAdminRole(myMembership?.role)

  const setActiveClubId = async (id: string) => {
    const result = await authClient.organization.setActive({ organizationId: id })
    if (result.error) {
      throw new Error(result.error.message ?? '')
    }
    setActiveClubIdState(id)
    storeActiveClubId(id)
  }

  const storedClubIsMember = clubs.some((club) => club.id === activeClubId)
  const needsChoice = !isLoading && clubs.length > 1 && !storedClubIsMember && !requestedClub

  if (needsChoice) {
    return <Navigate to="/choose-club" replace />
  }

  return (
    <ClubContext.Provider
      value={{
        clubs,
        activeClub,
        setActiveClubId,
        isLoading,
        refetchClubs: () => {
          void refetch()
        },
        myMembership,
        isClubAdmin,
        isMembershipLoading,
      }}
    >
      {children}
    </ClubContext.Provider>
  )
}

export function useClub() {
  const ctx = useContext(ClubContext)
  if (!ctx) throw new Error('useClub must be used within ClubProvider')
  return ctx
}
