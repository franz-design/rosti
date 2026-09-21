import { cn } from '@rosti/ui/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { HighlightShell } from './highlight-shell'
import { HIGHLIGHT_TONE_CLASS, type HighlightTone } from './highlight-tone'

interface StatTileProps {
  icon: LucideIcon
  tone: HighlightTone
  label: string
  value: number
}

export function StatTile({ icon: Icon, tone, label, value }: StatTileProps) {
  return (
    <HighlightShell className="flex items-center gap-3">
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          HIGHLIGHT_TONE_CLASS[tone],
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
      </div>
    </HighlightShell>
  )
}
