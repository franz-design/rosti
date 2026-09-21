import { Button } from '@rosti/ui/components/primitives/button'

interface ToggleChipProps {
  active: boolean
  disabled?: boolean
  onClick: () => void
  label: string
}

export function ToggleChip({ active, disabled, onClick, label }: ToggleChipProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      disabled={disabled}
      onClick={onClick}
      className="h-7 px-2.5 text-xs"
    >
      {label}
    </Button>
  )
}
