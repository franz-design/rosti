import { cn } from '@rosti/ui/lib/utils'
import type { SolarIcon } from '@rosti/ui/icons'
import { HighlightShell } from './highlight-shell'

interface StatTileProps {
  icon: SolarIcon
  label: string
  value: number
}

export function StatTile({ icon: Icon, label, value }: StatTileProps) {
  return (
    <HighlightShell className="flex items-center justify-between gap-3 py-8">
      <div className="flex gap-3 items-center">
        <span
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
          )}
        >
          <Icon className="size-5" />
        </span>
        <p className="text-sm font-medium tracking-wide text-foreground">{label}</p>
      </div>
      <p className="font-display text-4xl font-semibold tabular-nums">{value}</p>
    </HighlightShell>
  )
}
