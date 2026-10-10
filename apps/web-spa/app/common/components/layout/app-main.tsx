import { cn } from '@rosti/ui/lib/utils'
import type { ReactNode } from 'react'
import { useScrollToTop } from '../../hooks/use-scroll-to-top'
import { useAppShell } from '../../hooks/app-shell-context'

/**
 * Scrollable content area of the app shell. It is the only scroller on regular pages;
 * full-bleed pages hand scrolling over to their own inner regions.
 * The region resets to the top on each page change.
 */
export function AppMain({ children }: { children: ReactNode }) {
  const { isFullBleed } = useAppShell()
  const scrollRef = useScrollToTop<HTMLDivElement>()

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col',
        isFullBleed ? 'overflow-hidden' : 'overflow-auto p-3 sm:p-6',
      )}
    >
      {children}
    </div>
  )
}
