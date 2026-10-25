import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useLocation } from 'react-router'
import {
  PULL_SCROLL_TOP_SLOP_PX,
  classifyPullMove,
  followFinger,
  hasNestedScroller,
  isEditableTarget,
  nextPullOnRelease,
  refreshMountedQueries,
} from '../utils/pull-to-refresh'
import { shouldBlockEdgeOverscroll } from '../utils/scroll-edge'

interface PullToRefreshState {
  distance: number
  isPulling: boolean
  isRefreshing: boolean
}

const IDLE_PULL: PullToRefreshState = {
  distance: 0,
  isPulling: false,
  isRefreshing: false,
}

/**
 * Pull-to-refresh for the app shell scroller.
 * The document itself never scrolls, so the browser gesture does not run.
 * Touch only: a mouse wheel keeps its normal scroll.
 */
export function usePullToRefresh(
  scrollRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): PullToRefreshState {
  const queryClient = useQueryClient()
  const { pathname } = useLocation()
  const [state, setState] = useState<PullToRefreshState>(IDLE_PULL)
  const aliveRef = useRef(true)
  const generationRef = useRef(0)
  const refreshingRef = useRef(false)

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])

  useEffect(() => {
    const generation = generationRef.current + 1
    generationRef.current = generation
    refreshingRef.current = false
    setState(IDLE_PULL)

    const element = scrollRef.current
    if (!enabled || !element) return

    let startX = 0
    let startY = 0
    let distance = 0
    let tracking: 'ignore' | 'pending' | 'pull' = 'ignore'
    let frame = 0

    const publish = (next: PullToRefreshState): void => {
      refreshingRef.current = next.isRefreshing
      setState(next)
    }

    const finishPull = (commit: boolean): void => {
      if (tracking !== 'pull') return
      tracking = 'ignore'

      const releaseDistance = distance
      distance = 0
      publish({ distance: releaseDistance, isPulling: false, isRefreshing: false })

      const decision = commit ? nextPullOnRelease(releaseDistance) : { refresh: false, distance: 0 }
      if (decision.refresh) refreshingRef.current = true

      frame = window.requestAnimationFrame(() => {
        if (!aliveRef.current || generationRef.current !== generation) return
        if (!decision.refresh) {
          publish(IDLE_PULL)
          return
        }

        publish({ distance: decision.distance, isPulling: false, isRefreshing: true })
        void refreshMountedQueries(queryClient).finally(() => {
          if (!aliveRef.current || generationRef.current !== generation) return
          publish(IDLE_PULL)
        })
      })
    }

    const onStart = (event: TouchEvent): void => {
      if (refreshingRef.current || event.touches.length !== 1) {
        finishPull(false)
        tracking = 'ignore'
        return
      }

      const blocked =
        element.scrollTop > PULL_SCROLL_TOP_SLOP_PX ||
        isEditableTarget(event.target) ||
        hasNestedScroller(event.target, element)
      if (blocked) {
        tracking = 'ignore'
        return
      }

      const touch = event.touches[0]
      if (!touch) {
        tracking = 'ignore'
        return
      }

      startX = touch.clientX
      startY = touch.clientY
      distance = 0
      tracking = 'pending'
    }

    const onMove = (event: TouchEvent): void => {
      if (tracking === 'ignore' || event.touches.length !== 1) return

      const touch = event.touches[0]
      if (!touch) return

      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      const decision = classifyPullMove({
        deltaX,
        deltaY,
        scrollTop: element.scrollTop,
        isPulling: tracking === 'pull',
      })

      // Cancel the browser on the first pixels downward. The indicator still
      // waits for a clearer drag. Waiting to cancel lets iOS rubber-band, and
      // stopping that bounce halfway freezes scrolling and navigation.
      const blockNative =
        decision === 'pull' ||
        shouldBlockEdgeOverscroll({
          deltaX,
          deltaY,
          scrollTop: element.scrollTop,
          maxScrollTop: element.scrollHeight - element.clientHeight,
          // This listener only follows a touch that began at the top.
          startedAtTop: true,
          startedAtBottom: false,
        })
      if (blockNative && event.cancelable) event.preventDefault()

      if (decision === 'wait') return
      if (decision === 'ignore') {
        if (tracking === 'pull') publish(IDLE_PULL)
        distance = 0
        tracking = 'ignore'
        return
      }

      tracking = 'pull'
      distance = followFinger(deltaY)
      publish({ distance, isPulling: true, isRefreshing: false })
    }

    const onEnd = (): void => {
      finishPull(true)
    }

    const onCancel = (): void => {
      finishPull(false)
    }

    // passive: false so a downward pull can cancel the native scroll.
    element.addEventListener('touchstart', onStart, { passive: true })
    element.addEventListener('touchmove', onMove, { passive: false })
    element.addEventListener('touchend', onEnd)
    element.addEventListener('touchcancel', onCancel)

    return () => {
      window.cancelAnimationFrame(frame)
      element.removeEventListener('touchstart', onStart)
      element.removeEventListener('touchmove', onMove)
      element.removeEventListener('touchend', onEnd)
      element.removeEventListener('touchcancel', onCancel)
    }
  }, [enabled, pathname, queryClient, scrollRef])

  return state
}
