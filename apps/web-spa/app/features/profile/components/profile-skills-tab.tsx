import { useTranslation } from 'react-i18next'
import { PlayerSkillRatingsSection } from '@/features/players/components/player-skill-ratings'
import { ProfilePlayerPanel } from './profile-player-panel'

export function ProfileSkillsTab() {
  const { t } = useTranslation()

  return (
    <ProfilePlayerPanel>
      {(player, organizationId) =>
        player.skillRatings ? (
          <PlayerSkillRatingsSection
            organizationId={organizationId}
            playerUserId={player.userId}
            ratings={player.skillRatings}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t('profile.noSkills')}</p>
        )
      }
    </ProfilePlayerPanel>
  )
}
