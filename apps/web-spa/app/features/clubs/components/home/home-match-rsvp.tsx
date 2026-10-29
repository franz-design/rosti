import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useClub } from '@/features/clubs/hooks/club-context'
import { RsvpButtons } from '@/features/matches/components/match-detail/rsvp-buttons'
import {
  attendancesQueryKey,
  rollbackOptimisticAttendance,
  setOptimisticAttendance,
} from '@/features/matches/utils/optimistic-attendance'
import { authClient } from '@/lib/auth-client'
import { rostiApi } from '@/lib/rosti-api'

interface HomeMatchRsvpProps {
  matchId: string
}

export function HomeMatchRsvp({ matchId }: HomeMatchRsvpProps) {
  const { activeClub } = useClub()
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()
  const orgId = activeClub?.id

  const { data: attendances = [] } = useQuery({
    queryKey: attendancesQueryKey(orgId, matchId),
    queryFn: () => rostiApi.listAttendances(orgId!, matchId),
    enabled: !!orgId,
  })

  const myAttendance = attendances.find((attendance) => attendance.userId === session?.user?.id)

  const rsvp = useMutation({
    mutationFn: (status: 'present' | 'absent') =>
      rostiApi.respondAttendance(orgId!, matchId, status),
    onMutate: (status) => {
      const userId = session?.user?.id
      if (!orgId || !userId) return
      return setOptimisticAttendance({ queryClient, orgId, matchId, userId, status })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendancesQueryKey(orgId, matchId) })
      void queryClient.invalidateQueries({ queryKey: ['matches', orgId] })
      void queryClient.invalidateQueries({ queryKey: ['match', orgId, matchId] })
      void queryClient.invalidateQueries({ queryKey: ['lineups', orgId, matchId] })
    },
    onError: (error: Error, _status, context) => {
      if (orgId) rollbackOptimisticAttendance(queryClient, orgId, matchId, context)
      toast.error(error.message)
    },
  })

  return (
    <RsvpButtons
      direction="column"
      status={myAttendance?.status}
      disabled={!orgId}
      onPresent={() => {
        if (myAttendance?.status === 'present') return
        rsvp.mutate('present')
      }}
      onAbsent={() => {
        if (myAttendance?.status === 'absent') return
        rsvp.mutate('absent')
      }}
    />
  )
}
