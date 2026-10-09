import { useLayoutEffect } from 'react'

/**
 * Below this, a shrinking visual viewport is browser chrome collapsing, not a keyboard.
 */
const KEYBOARD_MIN_HEIGHT = 150

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

/** Split view does not span the screen, so the physical height would be too tall there. */
function fillsScreenWidth(): boolean {
  const { width } = physicalScreenSize()
  return Math.abs(window.innerWidth - width) <= 1
}

/**
 * Home-screen iOS reports a viewport far below the screen until the first touch.
 * A reported height within this distance is the real visible area. Beyond it, the
 * physical screen is the best value we have.
 */
const LAUNCH_GAP = 40

/** Home indicator. Keeps the tab labels visible when iOS reports a zero bottom inset. */
const STANDALONE_BOTTOM_INSET = 'max(env(safe-area-inset-bottom, 0px), 34px)'

/**
 * Prefer a reported height once it is close to the screen. Until then iOS is still
 * short by the launch gap, and the physical height fills the blank band.
 */
function installedAppHeight(viewport: VisualViewport): number {
  const physical = physicalScreenSize().height
  const visual = viewport.offsetTop + viewport.height
  const layout = window.innerHeight

  if (physical - visual <= LAUNCH_GAP && physical - visual >= 0) return visual
  if (physical - layout <= LAUNCH_GAP && physical - layout >= 0) return layout
  return physical
}

/**
 * Mirrors `window.visualViewport` into CSS variables so the app shell can size itself
 * against the area the user actually sees.
 *
 * iOS Safari keeps the layout viewport at its full height when the on-screen keyboard
 * opens and pans the visual viewport instead, which pushes fixed-height shells built on
 * `dvh` off screen.
 *
 * Sets `--app-height`, `--app-viewport-offset`, `--keyboard-height` and
 * `--safe-area-bottom` on `<html>`.
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
      const height = installedAppHeight(viewport)

      if (keyboardHeight === 0 && isInstalledApp() && fillsScreenWidth() && height > 0) {
        root.style.setProperty('--app-height', `${height}px`)
        root.style.setProperty('--app-viewport-offset', '0px')
        root.style.setProperty('--keyboard-height', '0px')
        root.style.setProperty('--safe-area-bottom', STANDALONE_BOTTOM_INSET)
        return
      }

      root.style.removeProperty('--safe-area-bottom')
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
      root.style.removeProperty('--safe-area-bottom')
    }
  }, [])
}
