import { Button } from '@rosti/ui/components/primitives/button'

interface NotificationToggleProps {
  label: string
  value: boolean
  onToggle: () => void
}

export function NotificationToggle({ label, value, onToggle }: NotificationToggleProps) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <Button size="sm" variant={value ? 'default' : 'outline'} onClick={onToggle}>
        {value ? 'On' : 'Off'}
      </Button>
    </li>
  )
}
