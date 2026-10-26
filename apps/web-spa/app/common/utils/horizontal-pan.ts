/**
 * Keeps a horizontal offset inside the distance the track can travel.
 * The track stops at either end, so the first and last tabs stay against the frame
 * instead of sitting in the middle with empty space beside them.
 */
export function clampPanOffset(offset: number, span: number): number {
  if (span <= 0) return 0
  if (offset > 0) return 0
  if (offset < -span) return -span
  return offset
}

export interface PanRevealInput {
  offset: number
  frameStart: number
  frameEnd: number
  childStart: number
  childEnd: number
  span: number
}

/** Shifts the track so a tab that sits outside the frame comes back into view. */
export function panOffsetToReveal(input: PanRevealInput): number {
  if (input.childStart < input.frameStart) {
    return clampPanOffset(input.offset + (input.frameStart - input.childStart), input.span)
  }
  if (input.childEnd > input.frameEnd) {
    return clampPanOffset(input.offset - (input.childEnd - input.frameEnd), input.span)
  }
  return input.offset
}

/** Shifts the track so a tab sits in the middle of the frame, without sliding past either end. */
export function panOffsetToCenter(input: PanRevealInput): number {
  if (input.span <= 0) return 0
  const frameCenter = (input.frameStart + input.frameEnd) / 2
  const childCenter = (input.childStart + input.childEnd) / 2
  return clampPanOffset(input.offset + (frameCenter - childCenter), input.span)
}

/** Offset that places a point measured from the track's left edge in the middle of the frame. */
export function panOffsetForTabCenter(tabCenter: number, frameWidth: number, span: number): number {
  if (span <= 0 || frameWidth <= 0) return 0
  return clampPanOffset(frameWidth / 2 - tabCenter, span)
}
