import type { ReactNode } from 'react'
import { Button } from '@rosti/ui/components/primitives/button'

interface ToggleChipProps {
  active: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  icon: ReactNode
}

export function ToggleChip({ active, disabled, onClick, label, icon }: ToggleChipProps) {
  return (
    <Button
      type="button"
      size="lg"
      variant={active ? 'default' : 'outline'}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="h-9 w-9 px-0 text-lg md:w-auto md:px-2.5 md:text-xs"
    >
      <span className="flex md:hidden">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </Button>
  )
}
