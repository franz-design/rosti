import { PlayerSeasonStats } from '@/features/players/components/player-season-stats'
import { ProfilePlayerPanel } from './profile-player-panel'

export function ProfileStatsTab() {
  return (
    <ProfilePlayerPanel>
      {(player) => <PlayerSeasonStats season={player.season} stats={player.stats} />}
    </ProfilePlayerPanel>
  )
}
