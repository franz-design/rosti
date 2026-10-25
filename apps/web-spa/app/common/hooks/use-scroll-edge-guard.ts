import { useEffect, type RefObject } from 'react'
import { hasNestedScroller, isEditableTarget } from '../utils/pull-to-refresh'
import {
  isScrollAtBottom,
  isScrollAtTop,
  scrollTopOffEdge,
  shouldBlockEdgeOverscroll,
} from '../utils/scroll-edge'

/**
 * Keeps an iOS drag inside this scroller.
 * The document does not scroll, so a pull past the top or the bottom bounces the
 * web view. In the installed app that bounce then swallows later touches.
 */
export function useScrollEdgeGuard(scrollRef: RefObject<HTMLElement | null>, enabled = true): void {
  useEffect(() => {
    const element = scrollRef.current
    if (!enabled || !element) return

    let startX = 0
    let startY = 0
    let tracking = false
    let startedAtTop = false
    let startedAtBottom = false

    const onStart = (event: TouchEvent): void => {
      if (event.touches.length !== 1) {
        tracking = false
        return
      }

      const touch = event.touches[0]
      if (!touch || isEditableTarget(event.target) || hasNestedScroller(event.target, element)) {
        tracking = false
        return
      }

      const maxScrollTop = element.scrollHeight - element.clientHeight
      startedAtTop = isScrollAtTop(element.scrollTop)
      startedAtBottom = isScrollAtBottom(element.scrollTop, maxScrollTop)
      const nextTop = scrollTopOffEdge(element.scrollTop, maxScrollTop)
      if (nextTop !== element.scrollTop) element.scrollTop = nextTop

      startX = touch.clientX
      startY = touch.clientY
      tracking = true
    }

    const onMove = (event: TouchEvent): void => {
      if (!tracking || event.touches.length !== 1) return

      const touch = event.touches[0]
      if (!touch) return

      const block = shouldBlockEdgeOverscroll({
        deltaX: touch.clientX - startX,
        deltaY: touch.clientY - startY,
        scrollTop: element.scrollTop,
        maxScrollTop: element.scrollHeight - element.clientHeight,
        startedAtTop,
        startedAtBottom,
      })
      if (block && event.cancelable) event.preventDefault()
    }

    const onEnd = (): void => {
      tracking = false
    }

    element.addEventListener('touchstart', onStart, { passive: true })
    element.addEventListener('touchmove', onMove, { passive: false })
    element.addEventListener('touchend', onEnd)
    element.addEventListener('touchcancel', onEnd)

    return () => {
      element.removeEventListener('touchstart', onStart)
      element.removeEventListener('touchmove', onMove)
      element.removeEventListener('touchend', onEnd)
      element.removeEventListener('touchcancel', onEnd)
    }
  }, [enabled, scrollRef])
}
