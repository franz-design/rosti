import type { ReactNode } from 'react'

interface MatchInfoItemProps {
  icon: ReactNode
  label: string
  value: string
}

export function MatchInfoItem({ icon, label, value }: MatchInfoItemProps) {
  return (
    <div className="space-y-1 rounded-lg border p-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}
