import { useLayoutEffect } from 'react'

/**
 * Below this, a shrinking visual viewport is browser chrome collapsing, not a keyboard.
 */
const KEYBOARD_MIN_HEIGHT = 150

/**
 * Mirrors the on-screen keyboard into CSS variables.
 *
 * The app shell is pinned with `top` and `bottom`, not a measured height.
 * On an installed iPhone, `screen.height` is about 59px taller than the visible
 * viewport (the Dynamic Island). A shell of that height draws the tab bar past
 * the bottom edge, so only the tips of the icons remain.
 *
 * iOS also keeps the layout viewport at full height when the keyboard opens and
 * pans the visual viewport instead. `--app-viewport-offset` and
 * `--app-bottom-offset` then shrink the shell to the area the user can see.
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

      root.style.setProperty('--keyboard-height', `${keyboardHeight}px`)

      if (keyboardHeight > 0) {
        root.style.setProperty('--app-viewport-offset', `${viewport.offsetTop}px`)
        root.style.setProperty('--app-bottom-offset', `${hiddenBelow}px`)
        return
      }

      root.style.setProperty('--app-viewport-offset', '0px')
      root.style.setProperty('--app-bottom-offset', '0px')
    }

    applyViewportMetrics()
    viewport.addEventListener('resize', applyViewportMetrics)
    viewport.addEventListener('scroll', applyViewportMetrics)
    orientation.addEventListener('change', applyViewportMetrics)

    return () => {
      viewport.removeEventListener('resize', applyViewportMetrics)
      viewport.removeEventListener('scroll', applyViewportMetrics)
      orientation.removeEventListener('change', applyViewportMetrics)
      root.style.removeProperty('--app-viewport-offset')
      root.style.removeProperty('--app-bottom-offset')
      root.style.removeProperty('--keyboard-height')
    }
  }, [])
}
