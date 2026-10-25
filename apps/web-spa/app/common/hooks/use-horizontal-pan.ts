import { useEffect, type RefObject } from 'react'
import { clampPanOffset, panOffsetToReveal } from '../utils/horizontal-pan'

const PAN_ACTIVATION_PX = 8

/**
 * Slides the first child sideways without making this frame a scroll container.
 * On iPhone, a nested overflow scroller stops the page once it reaches the top.
 */
export function useHorizontalPan(frameRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const frame = frameRef.current
    const track = frame?.firstElementChild
    if (!frame || !(track instanceof HTMLElement)) return

    let current = 0
    let startX = 0
    let startY = 0
    let origin = 0
    let mode: 'pending' | 'pan' | 'scroll' = 'pending'

    const span = (): number => track.scrollWidth - frame.clientWidth

    const paint = (offset: number): void => {
      current = clampPanOffset(offset, span())
      track.style.transform = current === 0 ? '' : `translateX(${current}px)`
    }

    const reveal = (child: HTMLElement): void => {
      const frameRect = frame.getBoundingClientRect()
      const childRect = child.getBoundingClientRect()
      paint(
        panOffsetToReveal({
          offset: current,
          frameStart: frameRect.left,
          frameEnd: frameRect.right,
          childStart: childRect.left,
          childEnd: childRect.right,
          span: span(),
        }),
      )
    }

    const revealActive = (): void => {
      const active = track.querySelector<HTMLElement>('[data-active], [aria-selected="true"]')
      if (active) reveal(active)
    }

    const onStart = (event: TouchEvent): void => {
      if (event.touches.length !== 1) {
        mode = 'scroll'
        return
      }
      const touch = event.touches[0]
      if (!touch) return
      startX = touch.clientX
      startY = touch.clientY
      origin = current
      mode = 'pending'
    }

    const onMove = (event: TouchEvent): void => {
      if (mode === 'scroll' || event.touches.length !== 1) return
      const touch = event.touches[0]
      if (!touch) return

      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      if (mode === 'pending') {
        if (Math.abs(deltaX) < PAN_ACTIVATION_PX && Math.abs(deltaY) < PAN_ACTIVATION_PX) return
        if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          mode = 'scroll'
          return
        }
        mode = 'pan'
      }

      if (event.cancelable) event.preventDefault()
      paint(origin + deltaX)
    }

    const onEnd = (): void => {
      mode = 'pending'
    }

    const onWheel = (event: WheelEvent): void => {
      if (span() <= 0 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      paint(current - event.deltaX)
    }

    const onFocusIn = (event: FocusEvent): void => {
      if (event.target instanceof HTMLElement && track.contains(event.target)) reveal(event.target)
    }

    frame.addEventListener('touchstart', onStart, { passive: true })
    frame.addEventListener('touchmove', onMove, { passive: false })
    frame.addEventListener('touchend', onEnd)
    frame.addEventListener('touchcancel', onEnd)
    frame.addEventListener('wheel', onWheel, { passive: false })
    frame.addEventListener('focusin', onFocusIn)

    const observer = new ResizeObserver(() => {
      paint(current)
      revealActive()
    })
    observer.observe(frame)
    observer.observe(track)
    revealActive()

    return () => {
      observer.disconnect()
      frame.removeEventListener('touchstart', onStart)
      frame.removeEventListener('touchmove', onMove)
      frame.removeEventListener('touchend', onEnd)
      frame.removeEventListener('touchcancel', onEnd)
      frame.removeEventListener('wheel', onWheel)
      frame.removeEventListener('focusin', onFocusIn)
      track.style.transform = ''
    }
  }, [frameRef])
}
