/** Keeps a horizontal offset inside the distance the track can travel. */
export function clampPanOffset(offset: number, span: number): number {
  const max = Math.max(0, span)
  if (offset >= 0 || max === 0) return 0
  if (offset < -max) return -max
  return offset
}

interface PanRevealInput {
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
