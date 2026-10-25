import { cn } from '@rosti/ui/lib/utils'
import type { ReactNode } from 'react'
import { useAppShell } from '../../hooks/app-shell-context'
import { usePullToRefresh } from '../../hooks/use-pull-to-refresh'
import { useScrollEdgeGuard } from '../../hooks/use-scroll-edge-guard'
import { useScrollToTop } from '../../hooks/use-scroll-to-top'
import { PULL_SETTLE_MS } from '../../utils/pull-to-refresh'
import { PullToRefreshIndicator } from './pull-to-refresh-indicator'

/**
 * Scrollable content area of the app shell. It is the only scroller on regular pages;
 * full-bleed pages hand scrolling over to their own inner regions.
 * The region resets to the top on each page change.
 * On touch, pulling down from the top refetches the data already on screen.
 */
export function AppMain({ children }: { children: ReactNode }) {
  const { isFullBleed } = useAppShell()
  const scrollRef = useScrollToTop<HTMLDivElement>()
  const { distance, isPulling, isRefreshing } = usePullToRefresh(scrollRef, !isFullBleed)
  useScrollEdgeGuard(scrollRef, !isFullBleed)

  return (
    <div
      ref={scrollRef}
      aria-busy={isRefreshing || undefined}
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col',
        isFullBleed ? 'overflow-hidden' : 'overflow-auto overscroll-y-none p-3 sm:p-6',
      )}
    >
      <div
        className={cn(
          'relative flex w-full min-w-0 flex-col',
          // One pixel taller than the scroller, so a short page can still move
          // and iOS does not bounce the installed app.
          isFullBleed ? 'min-h-0 flex-1' : 'min-h-[calc(100%+1px)]',
        )}
        style={
          isFullBleed
            ? undefined
            : {
                paddingTop: distance,
                transition: isPulling ? 'none' : `padding-top ${PULL_SETTLE_MS}ms ease-out`,
              }
        }
      >
        {isFullBleed ? null : (
          <PullToRefreshIndicator
            distance={distance}
            isPulling={isPulling}
            isRefreshing={isRefreshing}
          />
        )}
        {children}
      </div>
    </div>
  )
}
