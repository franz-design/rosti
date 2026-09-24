import { useEffect } from 'react'

/**
 * Below this, a shrinking visual viewport is browser chrome collapsing, not a keyboard.
 */
const KEYBOARD_MIN_HEIGHT = 150

/**
 * Mirrors `window.visualViewport` into CSS variables so the app shell can size itself
 * against the area the user actually sees.
 *
 * iOS Safari keeps the layout viewport at its full height when the on-screen keyboard
 * opens and pans the visual viewport instead, which pushes fixed-height shells built on
 * `dvh` off screen.
 *
 * Sets `--app-height`, `--app-viewport-offset` and `--keyboard-height` on `<html>`.
 */
export function useViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const root = document.documentElement

    const applyViewportMetrics = () => {
      const hiddenBelow = window.innerHeight - viewport.height - viewport.offsetTop
      const keyboardHeight = hiddenBelow > KEYBOARD_MIN_HEIGHT ? hiddenBelow : 0

      root.style.setProperty('--app-height', `${viewport.height}px`)
      root.style.setProperty('--app-viewport-offset', `${viewport.offsetTop}px`)
      root.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
    }

    applyViewportMetrics()
    viewport.addEventListener('resize', applyViewportMetrics)
    viewport.addEventListener('scroll', applyViewportMetrics)

    return () => {
      viewport.removeEventListener('resize', applyViewportMetrics)
      viewport.removeEventListener('scroll', applyViewportMetrics)
      root.style.removeProperty('--app-height')
      root.style.removeProperty('--app-viewport-offset')
      root.style.removeProperty('--keyboard-height')
    }
  }, [])
}
