import { cn } from '@rosti/ui/lib/utils'

interface StatValueProps {
  label: string
  value: number
}

export function StatValue({ label, value }: StatValueProps) {
  return (
    <span
      className={cn('text-center tabular-nums', value > 0 && 'font-semibold')}
      aria-label={`${label} ${value}`}
    >
      {value}
    </span>
  )
}
