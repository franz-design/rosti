import { Button } from '@rosti/ui/components/primitives/button'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { CheckIcon } from '@rosti/ui/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { PlayerAvatar } from '@/common/components/player-avatar'
import { PlayerLink } from '@/common/components/player-link'
import { useClub } from '@/features/clubs/hooks/club-context'
import { rostiApi, type PlayerVoteState } from '@/lib/rosti-api'

export function PlayerVotePanel() {
  const { matchId } = useParams()
  const { activeClub } = useClub()
  const organizationId = activeClub?.id
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const dateLocale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'
  const enabled = !!organizationId && !!matchId

  const { data: vote } = useQuery({
    queryKey: ['player-vote', organizationId, matchId],
    queryFn: () => rostiApi.getPlayerVote(organizationId!, matchId!),
    enabled,
  })

  const castVote = useMutation({
    mutationFn: (nomineeUserId: string) =>
      rostiApi.castPlayerVote(organizationId!, matchId!, nomineeUserId),
    onSuccess: (state) => {
      queryClient.setQueryData(['player-vote', organizationId, matchId], state)
      toast.success(t('matches.detail.playerVote.saved'))
      if (state.phase === 'closed') {
        void queryClient.invalidateQueries({ queryKey: ['home-stats', organizationId] })
      }
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (!vote || !shouldShowPlayerVote(vote)) return null

  const deadline = vote.closesAt
    ? new Date(vote.closesAt).toLocaleString(dateLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="text-base font-medium">{t('matches.detail.playerVote.title')}</h2>
      {vote.phase === 'closed' ? (
        <ClosedVote vote={vote} />
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            {deadline
              ? t('matches.detail.playerVote.invite', { date: deadline })
              : t('matches.detail.playerVote.inviteOpen')}
          </p>
          {vote.candidates.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t('matches.detail.playerVote.noCandidates')}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {vote.candidates.map((player) => {
                const isSelected = vote.myNomineeUserId === player.userId
                return (
                  <li
                    key={player.userId}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <PlayerLink
                      userId={player.userId}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <PlayerAvatar name={player.userName} imageUrl={player.image} size="sm" />
                      <span className="truncate group-hover:underline">{player.userName}</span>
                    </PlayerLink>
                    <Button
                      type="button"
                      size="sm"
                      variant={isSelected ? 'secondary' : 'outline'}
                      aria-pressed={isSelected}
                      aria-label={t('matches.detail.playerVote.voteFor', { name: player.userName })}
                      disabled={castVote.isPending}
                      onClick={() => {
                        if (isSelected) return
                        castVote.mutate(player.userId)
                      }}
                    >
                      {isSelected ? <CheckIcon className="size-4" /> : null}
                      {t('matches.detail.playerVote.vote')}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

function ClosedVote({ vote }: { vote: PlayerVoteState }) {
  const { t } = useTranslation()
  if (vote.winner) {
    return (
      <PlayerLink userId={vote.winner.userId} className="mt-3 flex items-center gap-3">
        <PlayerAvatar name={vote.winner.userName} imageUrl={vote.winner.image} />
        <div className="min-w-0">
          <p className="truncate font-medium group-hover:underline">{vote.winner.userName}</p>
          <p className="text-sm text-muted-foreground">
            {t('matches.detail.playerVote.winner', { name: vote.winner.userName })}
          </p>
        </div>
      </PlayerLink>
    )
  }

  return (
    <p className="mt-3 text-sm text-muted-foreground">
      {t(vote.isTie ? 'matches.detail.playerVote.tie' : 'matches.detail.playerVote.none')}
    </p>
  )
}

function shouldShowPlayerVote(vote: PlayerVoteState): boolean {
  if (vote.phase === 'closed') return true
  return vote.phase === 'open' && vote.canVote
}
