import type { LucideIcon } from 'lucide-react'
import { HighlightLabel } from './highlight-label'
import { HighlightShell } from './highlight-shell'
import type { HighlightTone } from './highlight-tone'

interface NumberHighlightCardProps {
  icon: LucideIcon
  tone: HighlightTone
  label: string
  value: number
}

export function NumberHighlightCard({ icon, tone, label, value }: NumberHighlightCardProps) {
  return (
    <HighlightShell className="h-full">
      <HighlightLabel icon={icon} tone={tone} label={label} />
      <p className="mt-4 font-display text-4xl font-semibold tracking-tight tabular-nums">{value}</p>
    </HighlightShell>
  )
}
