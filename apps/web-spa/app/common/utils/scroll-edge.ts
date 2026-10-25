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
}

/**
 * True when this drag would leave the scroller and bounce the web view.
 * A sideways drag is left alone so a horizontal strip can still move.
 */
export function shouldBlockEdgeOverscroll(input: EdgeOverscrollInput): boolean {
  if (input.deltaY === 0) return false
  if (Math.abs(input.deltaX) > Math.abs(input.deltaY)) return false

  if (input.deltaY > 0) return input.scrollTop <= SCROLL_EDGE_SLOP_PX

  const maxScrollTop = Math.max(0, input.maxScrollTop)
  if (maxScrollTop <= SCROLL_EDGE_SLOP_PX) return input.scrollTop >= maxScrollTop
  return input.scrollTop >= maxScrollTop - SCROLL_EDGE_SLOP_PX
}
