import { cn } from '@rosti/ui/lib/utils'
import type { ReactNode } from 'react'
import { useAppShell } from '../hooks/app-shell-context'

/**
 * Scrollable content area of the app shell. It is the only scroller on regular pages;
 * full-bleed pages hand scrolling over to their own inner regions.
 */
export function AppMain({ children }: { children: ReactNode }) {
  const { isFullBleed } = useAppShell()

  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col',
        isFullBleed
          ? 'overflow-hidden max-md:pb-(--bottom-nav-inset)'
          : 'overflow-auto p-6 max-md:pb-[calc(1.5rem+var(--bottom-nav-inset))]',
      )}
    >
      {children}
    </div>
  )
}
