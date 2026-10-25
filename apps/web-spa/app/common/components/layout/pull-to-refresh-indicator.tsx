import { Loader2 } from '@rosti/ui/icons'
import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import { PULL_SETTLE_MS, PULL_THRESHOLD_PX } from '../../utils/pull-to-refresh'

interface PullToRefreshIndicatorProps {
  distance: number
  isPulling: boolean
  isRefreshing: boolean
}

/**
 * Loader revealed in the gap above the page while the user pulls down.
 */
export function PullToRefreshIndicator({
  distance,
  isPulling,
  isRefreshing,
}: PullToRefreshIndicatorProps) {
  const { t } = useTranslation()
  const progress = Math.min(distance / PULL_THRESHOLD_PX, 1)
  const transition = isPulling ? 'none' : `height ${PULL_SETTLE_MS}ms ease-out`

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center overflow-hidden"
      style={{ height: distance, transition }}
      role={isRefreshing ? 'status' : undefined}
      aria-hidden={isRefreshing ? undefined : true}
    >
      <Loader2
        aria-hidden
        className={cn('size-5 text-primary', isRefreshing && 'animate-spin')}
        style={
          isRefreshing
            ? undefined
            : {
                opacity: progress,
                transform: `rotate(${progress * 180}deg) scale(${0.65 + progress * 0.35})`,
              }
        }
      />
      {isRefreshing ? <span className="sr-only">{t('common.refreshing')}</span> : null}
    </div>
  )
}
