import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'
import { isPlayerMissingError } from '@/features/players/utils/is-player-missing-error'
import { fetchPlayerDetailQueryOptions } from '@/features/players/utils/players-queries'
import { authClient } from '@/lib/auth-client'
import type { PlayerDetail } from '@/lib/rosti-api'

interface ProfilePlayerPanelProps {
  children: (player: PlayerDetail, organizationId: string) => ReactNode
}

export function ProfilePlayerPanel({ children }: ProfilePlayerPanelProps) {
  const { t } = useTranslation()
  const { activeClub, isLoading: isClubLoading } = useClub()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const userId = session?.user?.id
  const organizationId = activeClub?.id

  const {
    data: player,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...fetchPlayerDetailQueryOptions(organizationId ?? '', userId ?? ''),
    enabled: !!organizationId && !!userId,
  })

  if (isClubLoading || isSessionPending || (!!organizationId && !!userId && isLoading)) {
    return <p className="text-sm text-muted-foreground">{t('playerDetail.loading')}</p>
  }

  if (!organizationId) {
    return <p className="text-sm text-muted-foreground">{t('playerDetail.noClub')}</p>
  }

  if (isError && isPlayerMissingError(error)) {
    return <p className="text-sm text-muted-foreground">{t('playerDetail.notFound')}</p>
  }

  if (isError || !player) {
    return <p className="text-sm text-muted-foreground">{t('playerDetail.error')}</p>
  }

  return children(player, organizationId)
}
