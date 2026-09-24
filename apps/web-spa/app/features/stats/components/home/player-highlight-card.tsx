import type { SolarIcon } from '@rosti/ui/icons'
import type { PlayerHighlight } from '@/lib/rosti-api'
import { HighlightLabel } from './highlight-label'
import { HighlightShell } from './highlight-shell'
import type { HighlightTone } from './highlight-tone'
import { PlayerIdentity } from './player-identity'

interface PlayerHighlightCardProps {
  icon: SolarIcon
  tone: HighlightTone
  label: string
  player: PlayerHighlight | null
  unit: string
  empty: string
}

export function PlayerHighlightCard({
  icon,
  tone,
  label,
  player,
  unit,
  empty,
}: PlayerHighlightCardProps) {
  return (
    <HighlightShell className="h-full">
      <HighlightLabel icon={icon} tone={tone} label={label} />
      {player ? (
        <div className="mt-4 space-y-3">
          <PlayerIdentity name={player.userName} />
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-semibold tabular-nums">{player.value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">{empty}</p>
      )}
    </HighlightShell>
  )
}
