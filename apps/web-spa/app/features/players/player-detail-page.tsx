import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useClub } from '@/features/clubs/hooks/club-context'
import { PlayerDetailHeader } from './components/player-detail-header'
import { PlayerProfile } from './components/player-profile'
import { PlayerSeasonStats } from './components/player-season-stats'
import { PlayerSkillRatingsSection } from './components/player-skill-ratings'
import { isPlayerMissingError } from './utils/is-player-missing-error'
import { fetchPlayerDetailQueryOptions } from './utils/players-queries'

export default function PlayerDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { activeClub } = useClub()
  const organizationId = activeClub?.id

  const {
    data: player,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...fetchPlayerDetailQueryOptions(organizationId ?? '', id ?? ''),
    enabled: !!organizationId && !!id,
  })

  if (!organizationId) {
    return <p className="text-sm text-muted-foreground">{t('playerDetail.noClub')}</p>
  }

  return (
    <div className="space-y-8">
      <PlayerDetailHeader />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('playerDetail.loading')}</p>
      ) : null}
      {isError && isPlayerMissingError(error) ? (
        <p className="text-sm text-muted-foreground">{t('playerDetail.notFound')}</p>
      ) : null}
      {isError && !isPlayerMissingError(error) ? (
        <p className="text-sm text-muted-foreground">{t('playerDetail.error')}</p>
      ) : null}
      {player ? (
        <>
          <PlayerProfile player={player} />
          <PlayerSeasonStats season={player.season} stats={player.stats} />
          {player.skillRatings ? (
            <PlayerSkillRatingsSection
              organizationId={organizationId}
              playerUserId={player.userId}
              ratings={player.skillRatings}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
