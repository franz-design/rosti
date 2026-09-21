import { cn } from '@rosti/ui/lib/utils'

type TeamSide = 'blue' | 'red'

interface TeamToggleButtonProps {
  active: boolean
  tone: TeamSide
  label: string
  onClick: () => void
}

export function TeamToggleButton({ active, tone, label, onClick }: TeamToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        active && tone === 'blue' && 'bg-team-blue text-white',
        active && tone === 'red' && 'bg-primary text-primary-foreground',
        !active && 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
