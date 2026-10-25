import type { QueryClient } from '@tanstack/react-query'

/** Finger travel below this stays a normal scroll or a tap. */
export const PULL_ACTIVATION_PX = 8

/** Visual pull that commits a refresh. About 85px of finger travel. */
export const PULL_THRESHOLD_PX = 64

/** Furthest the content follows the finger. */
export const PULL_MAX_PX = 120

/** Gap kept open while the refresh is in flight. */
export const PULL_HOLD_PX = 48

/** How much of the finger travel the content follows. */
export const PULL_RESISTANCE = 0.75

/** Scroll positions this close to the top still count as the top. */
export const PULL_SCROLL_TOP_SLOP_PX = 1

/** Close animation after the finger lifts. */
export const PULL_SETTLE_MS = 200

/** Keeps the loader visible when the refetch itself is instant. */
export const PULL_MIN_VISIBLE_MS = 400

export type PullMove = 'wait' | 'ignore' | 'pull'

interface PullMoveInput {
  deltaX: number
  deltaY: number
  scrollTop: number
  isPulling: boolean
}

export interface PullRelease {
  refresh: boolean
  distance: number
}

/**
 * Maps a downward drag to the distance the content should move.
 * The content lags behind the finger and stops at a cap.
 */
export function followFinger(rawDeltaY: number): number {
  if (rawDeltaY <= 0) return 0
  return Math.min(PULL_MAX_PX, Math.round(rawDeltaY * PULL_RESISTANCE))
}

/**
 * Decides whether this touch is still a pull, a scroll, or too small to call.
 * A pull only starts at the top, moving down, and more vertical than horizontal.
 */
export function classifyPullMove(input: PullMoveInput): PullMove {
  if (input.scrollTop > PULL_SCROLL_TOP_SLOP_PX) return 'ignore'
  if (input.isPulling) {
    if (input.deltaY <= 0) return 'ignore'
    return 'pull'
  }

  const horizontalTravel = Math.abs(input.deltaX)
  const verticalTravel = Math.abs(input.deltaY)
  if (verticalTravel < PULL_ACTIVATION_PX && horizontalTravel < PULL_ACTIVATION_PX) return 'wait'
  if (input.deltaY <= 0 || horizontalTravel > input.deltaY) return 'ignore'
  return 'pull'
}

/** Commits a refresh once the visual pull has passed the threshold. */
export function nextPullOnRelease(distance: number): PullRelease {
  if (distance >= PULL_THRESHOLD_PX) {
    return { refresh: true, distance: PULL_HOLD_PX }
  }
  return { refresh: false, distance: 0 }
}

/**
 * Refetches every query currently on screen.
 * A failed query keeps its own error state. The gesture still ends.
 */
export async function refreshMountedQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.refetchQueries({ type: 'active' }).then(
      () => undefined,
      () => undefined,
    ),
    delay(PULL_MIN_VISIBLE_MS),
  ])
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** True when the touch started in a field the user may be editing. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return target.closest('input, textarea, select, [contenteditable="true"]') !== null
}

/**
 * True when a child region between the finger and the page scroller can scroll.
 * That region owns the gesture, so the page does not refresh.
 */
export function hasNestedScroller(target: EventTarget | null, boundary: HTMLElement): boolean {
  if (!(target instanceof Element)) return false

  let node: Element | null = target
  while (node !== null && node !== boundary) {
    if (node instanceof HTMLElement && canScrollVertically(node)) return true
    node = node.parentElement
  }
  return false
}

function canScrollVertically(element: HTMLElement): boolean {
  const { overflowY } = window.getComputedStyle(element)
  const scrolls = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
  return scrolls && element.scrollHeight - element.clientHeight > 1
}
