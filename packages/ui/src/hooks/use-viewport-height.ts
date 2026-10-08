import { useLayoutEffect } from 'react'

/**
 * Below this, a shrinking visual viewport is browser chrome collapsing, not a keyboard.
 */
const KEYBOARD_MIN_HEIGHT = 150

/**
 * Home-screen iOS reports a short viewport, including `100dvh`, until the first touch.
 * The physical screen size is correct immediately. Use it only when the window spans
 * the screen: split view would make that height too tall.
 */
function isInstalledApp(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
  return navigatorWithStandalone.standalone === true
}

/**
 * iOS keeps `screen.width` and `screen.height` in portrait. Android swaps them on rotation.
 * Return the sides that are actually horizontal and vertical right now.
 */
function physicalScreenSize(): { width: number; height: number } {
  const { width, height } = window.screen
  const isLandscape = window.matchMedia('(orientation: landscape)').matches
  const reportedInPortrait = height >= width
  const swap = isLandscape === reportedInPortrait

  return swap ? { width: height, height: width } : { width, height }
}

function fillsScreenWidth(): boolean {
  const { width } = physicalScreenSize()
  return Math.abs(window.innerWidth - width) <= 1
}

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
  useLayoutEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const root = document.documentElement
    const orientation = window.matchMedia('(orientation: landscape)')

    const applyViewportMetrics = () => {
      const hiddenBelow = window.innerHeight - viewport.height - viewport.offsetTop
      const keyboardHeight = hiddenBelow > KEYBOARD_MIN_HEIGHT ? hiddenBelow : 0
      const { height } = physicalScreenSize()

      if (keyboardHeight === 0 && isInstalledApp() && fillsScreenWidth() && height > 0) {
        root.style.setProperty('--app-height', `${height}px`)
        root.style.setProperty('--app-viewport-offset', '0px')
        root.style.setProperty('--keyboard-height', '0px')
        return
      }

      root.style.setProperty('--app-height', `${viewport.height}px`)
      root.style.setProperty('--app-viewport-offset', `${viewport.offsetTop}px`)
      root.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
    }

    applyViewportMetrics()
    viewport.addEventListener('resize', applyViewportMetrics)
    viewport.addEventListener('scroll', applyViewportMetrics)
    orientation.addEventListener('change', applyViewportMetrics)

    return () => {
      viewport.removeEventListener('resize', applyViewportMetrics)
      viewport.removeEventListener('scroll', applyViewportMetrics)
      orientation.removeEventListener('change', applyViewportMetrics)
      root.style.removeProperty('--app-height')
      root.style.removeProperty('--app-viewport-offset')
      root.style.removeProperty('--keyboard-height')
    }
  }, [])
}
