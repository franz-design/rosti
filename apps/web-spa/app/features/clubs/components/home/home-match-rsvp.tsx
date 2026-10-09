import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useClub } from '@/features/clubs/hooks/club-context'
import { RsvpButtons } from '@/features/matches/components/match-detail/rsvp-buttons'
import { authClient } from '@/lib/auth-client'
import { rostiApi, type Attendance } from '@/lib/rosti-api'

interface HomeMatchRsvpProps {
  matchId: string
}

export function HomeMatchRsvp({ matchId }: HomeMatchRsvpProps) {
  const { activeClub } = useClub()
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()
  const orgId = activeClub?.id

  const { data: attendances = [] } = useQuery({
    queryKey: ['attendances', orgId, matchId],
    queryFn: () => rostiApi.listAttendances(orgId!, matchId),
    enabled: !!orgId,
  })

  const myAttendance = attendances.find((attendance) => attendance.userId === session?.user?.id)

  const rsvp = useMutation({
    mutationFn: (status: 'present' | 'absent') =>
      rostiApi.respondAttendance(orgId!, matchId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendances', orgId, matchId] })
      void queryClient.invalidateQueries({ queryKey: ['matches', orgId] })
      void queryClient.invalidateQueries({ queryKey: ['match', orgId, matchId] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const status: Attendance['status'] | undefined = rsvp.isPending
    ? rsvp.variables
    : myAttendance?.status

  return (
    <RsvpButtons
      direction="column"
      status={status}
      disabled={!orgId || rsvp.isPending}
      onPresent={() => rsvp.mutate('present')}
      onAbsent={() => rsvp.mutate('absent')}
    />
  )
}
