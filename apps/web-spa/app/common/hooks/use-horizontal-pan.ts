import { useEffect, type RefObject } from 'react'
import { clampPanOffset, panOffsetForTabCenter, panOffsetToReveal, type PanRevealInput } from '../utils/horizontal-pan'

const PAN_ACTIVATION_PX = 8
const CENTER_TRANSITION = 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'

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
    let ignoreClick = false
    let fromPointer = false
    let animating = false

    const span = (): number => track.scrollWidth - frame.clientWidth

    const paint = (offset: number, animate: boolean): void => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const shouldAnimate = animate && !reduceMotion
      current = clampPanOffset(offset, span())
      animating = shouldAnimate
      track.style.transition = shouldAnimate ? CENTER_TRANSITION : 'none'
      track.style.transform = current === 0 ? '' : `translateX(${current}px)`
    }

    const place = (
      child: HTMLElement,
      nextOffset: (input: PanRevealInput) => number,
      animate: boolean,
    ): void => {
      const frameRect = frame.getBoundingClientRect()
      const childRect = child.getBoundingClientRect()
      paint(
        nextOffset({
          offset: current,
          frameStart: frameRect.left,
          frameEnd: frameRect.right,
          childStart: childRect.left,
          childEnd: childRect.right,
          span: span(),
        }),
        animate,
      )
    }

    const reveal = (child: HTMLElement): void => {
      place(child, panOffsetToReveal, false)
    }

    const center = (child: HTMLElement, animate: boolean): void => {
      const tabCenter = child.offsetLeft + child.offsetWidth / 2
      paint(panOffsetForTabCenter(tabCenter, frame.clientWidth, span()), animate)
    }

    const activeTab = (): HTMLElement | null =>
      track.querySelector<HTMLElement>('[data-active], [aria-selected="true"]')

    const centerActive = (animate: boolean): void => {
      const active = activeTab()
      if (active) center(active, animate)
    }

    const onStart = (event: TouchEvent): void => {
      if (event.touches.length !== 1) {
        mode = 'scroll'
        return
      }
      const touch = event.touches[0]
      if (!touch) return
      ignoreClick = false
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
      paint(origin + deltaX, false)
    }

    const onEnd = (): void => {
      if (mode === 'pan') ignoreClick = true
      mode = 'pending'
    }

    const onWheel = (event: WheelEvent): void => {
      if (span() <= 0 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      paint(current - event.deltaX, false)
    }

    const onFocusIn = (event: FocusEvent): void => {
      if (fromPointer) {
        fromPointer = false
        return
      }
      if (!(event.target instanceof Element)) return
      const tab = event.target.closest('[role="tab"]')
      if (tab instanceof HTMLElement && track.contains(tab)) reveal(tab)
    }

    const onPointerDown = (): void => {
      fromPointer = true
    }

    const onClick = (event: MouseEvent): void => {
      if (ignoreClick) {
        ignoreClick = false
        return
      }
      if (!(event.target instanceof Element)) return
      const tab = event.target.closest('[role="tab"]')
      if (!(tab instanceof HTMLElement) || !track.contains(tab)) return
      center(tab, true)
    }

    frame.addEventListener('touchstart', onStart, { passive: true })
    frame.addEventListener('touchmove', onMove, { passive: false })
    frame.addEventListener('touchend', onEnd)
    frame.addEventListener('touchcancel', onEnd)
    frame.addEventListener('wheel', onWheel, { passive: false })
    frame.addEventListener('focusin', onFocusIn)
    frame.addEventListener('pointerdown', onPointerDown)
    frame.addEventListener('click', onClick)

    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== track || event.propertyName !== 'transform') return
      animating = false
    }
    track.addEventListener('transitionend', onTransitionEnd)

    const observer = new ResizeObserver(() => {
      if (animating) return
      centerActive(false)
    })
    observer.observe(frame)
    observer.observe(track)

    const selectionObserver = new MutationObserver(() => {
      if (mode === 'pan') return
      centerActive(true)
    })
    selectionObserver.observe(track, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-active', 'aria-selected'],
    })

    centerActive(false)

    return () => {
      observer.disconnect()
      selectionObserver.disconnect()
      frame.removeEventListener('touchstart', onStart)
      frame.removeEventListener('touchmove', onMove)
      frame.removeEventListener('touchend', onEnd)
      frame.removeEventListener('touchcancel', onEnd)
      frame.removeEventListener('wheel', onWheel)
      frame.removeEventListener('focusin', onFocusIn)
      frame.removeEventListener('pointerdown', onPointerDown)
      frame.removeEventListener('click', onClick)
      track.removeEventListener('transitionend', onTransitionEnd)
      track.style.transform = ''
      track.style.transition = ''
    }
  }, [frameRef])
}
