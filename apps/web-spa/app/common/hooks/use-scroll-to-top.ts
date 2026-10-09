import { useLayoutEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router'

/**
 * Returns a ref for a nested scroll region and puts that region back at the
 * top when the page changes.
 *
 * React Router's `<ScrollRestoration>` is the documented way to do this, and
 * it is already mounted in the root. It only calls `window.scrollTo`. This
 * app pins the document and scrolls inside a region, so the window never
 * moves and that component has nothing to restore.
 *
 * The reset uses the same choices as `<ScrollRestoration>`: it runs in
 * `useLayoutEffect` (before paint, so the previous offset never flashes) and
 * it follows an in-page hash when the target exists. A new pathname is a new
 * page. Search updates on the same path, such as tabs, keep the current offset.
 */
export function useScrollToTop<T extends HTMLElement>(): RefObject<T | null> {
  const containerRef = useRef<T | null>(null)
  const { pathname, hash } = useLocation()
  const pathnameRef = useRef(pathname)

  useLayoutEffect(() => {
    const container = containerRef.current
    const pageChanged = pathnameRef.current !== pathname
    pathnameRef.current = pathname

    if (scrollToLocationHash(hash)) return
    if (!pageChanged || !container) return

    container.scrollTo(0, 0)
  }, [hash, pathname])

  return containerRef
}

function scrollToLocationHash(hash: string): boolean {
  if (hash.length < 2) return false

  try {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (!target) return false
    target.scrollIntoView()
    return true
  } catch {
    return false
  }
}
