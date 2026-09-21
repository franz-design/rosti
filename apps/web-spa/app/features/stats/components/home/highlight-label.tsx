import { cn } from '@rosti/ui/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { HIGHLIGHT_TONE_CLASS, type HighlightTone } from './highlight-tone'

interface HighlightLabelProps {
  icon: LucideIcon
  tone: HighlightTone
  label: string
}

export function HighlightLabel({ icon: Icon, tone, label }: HighlightLabelProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <span className={cn('flex size-8 items-center justify-center rounded-full', HIGHLIGHT_TONE_CLASS[tone])}>
        <Icon className="size-4" />
      </span>
      {label}
    </div>
  )
}
