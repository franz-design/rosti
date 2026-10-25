/** Positions this close to an edge still count as that edge. */
export const SCROLL_EDGE_SLOP_PX = 1

/**
 * Moves a scroller one pixel in from the top or the bottom.
 * A drag that starts exactly on the edge makes iOS bounce the whole web view.
 * After that bounce, an installed app stops scrolling and stops changing page.
 * A scroller that can still move in that direction does not bounce.
 * A list with less than two pixels of travel has no interior pixel to sit on.
 */
export function scrollTopOffEdge(scrollTop: number, maxScrollTop: number): number {
  if (maxScrollTop <= SCROLL_EDGE_SLOP_PX) return scrollTop
  if (scrollTop <= 0) return SCROLL_EDGE_SLOP_PX
  if (scrollTop >= maxScrollTop) return maxScrollTop - SCROLL_EDGE_SLOP_PX
  return scrollTop
}

interface EdgeOverscrollInput {
  deltaX: number
  deltaY: number
  scrollTop: number
  maxScrollTop: number
  /** True when this touch began at the top. A scroll that only arrives there keeps going. */
  startedAtTop: boolean
  /** True when this touch began at the bottom. */
  startedAtBottom: boolean
}

/** True when the scroller is sitting on its top edge. */
export function isScrollAtTop(scrollTop: number): boolean {
  return scrollTop <= SCROLL_EDGE_SLOP_PX
}

/** True when the scroller is sitting on its bottom edge. */
export function isScrollAtBottom(scrollTop: number, maxScrollTop: number): boolean {
  const max = Math.max(0, maxScrollTop)
  if (max <= SCROLL_EDGE_SLOP_PX) return scrollTop >= max
  return scrollTop >= max - SCROLL_EDGE_SLOP_PX
}

/**
 * True when this drag would leave the scroller and bounce the web view.
 * Only a drag that started on that edge is blocked. A drag that started in the
 * middle must be allowed to reach the top, or the page stops short of it.
 * A sideways drag is left alone so a horizontal strip can still move.
 */
export function shouldBlockEdgeOverscroll(input: EdgeOverscrollInput): boolean {
  if (input.deltaY === 0) return false
  if (Math.abs(input.deltaX) > Math.abs(input.deltaY)) return false

  if (input.deltaY > 0) return input.startedAtTop && isScrollAtTop(input.scrollTop)
  return input.startedAtBottom && isScrollAtBottom(input.scrollTop, input.maxScrollTop)
}
