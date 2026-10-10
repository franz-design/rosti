import { cn } from '@rosti/ui/lib/utils'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'

interface PlayerLinkProps {
  userId: string
  className?: string
  children: ReactNode
}

export function PlayerLink({ userId, className, children }: PlayerLinkProps) {
  const location = useLocation()

  return (
    <Link
      to={`/players/${userId}`}
      state={{ from: `${location.pathname}${location.search}` }}
      className={cn(
        'group min-w-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {children}
    </Link>
  )
}
