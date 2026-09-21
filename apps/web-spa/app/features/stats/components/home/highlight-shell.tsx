import { cn } from '@rosti/ui/lib/utils'
import type { ReactNode } from 'react'

interface HighlightShellProps {
  className?: string
  children: ReactNode
}

export function HighlightShell({ className, children }: HighlightShellProps) {
  return (
    <div className={cn('min-w-0 overflow-hidden rounded-xl border bg-card p-5 shadow-sm', className)}>
      {children}
    </div>
  )
}
