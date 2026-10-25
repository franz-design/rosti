import { describe, expect, it } from 'vitest'
import { clampPanOffset, panOffsetToReveal } from './horizontal-pan'

describe('clampPanOffset', () => {
  it('stays at the start', () => {
    expect(clampPanOffset(12, 100)).toBe(0)
    expect(clampPanOffset(0, 100)).toBe(0)
  })

  it('follows a drag within the track', () => {
    const inputOffset = -40
    expect(clampPanOffset(inputOffset, 100)).toBe(inputOffset)
  })

  it('stops at the end of the track', () => {
    expect(clampPanOffset(-180, 100)).toBe(-100)
  })

  it('does not move a track that already fits', () => {
    expect(clampPanOffset(-20, 0)).toBe(0)
  })
})

describe('panOffsetToReveal', () => {
  it('pulls a tab that is clipped on the left', () => {
    expect(
      panOffsetToReveal({
        offset: -80,
        frameStart: 16,
        frameEnd: 320,
        childStart: 0,
        childEnd: 72,
        span: 200,
      }),
    ).toBe(-64)
  })

  it('pulls a tab that is clipped on the right', () => {
    expect(
      panOffsetToReveal({
        offset: 0,
        frameStart: 0,
        frameEnd: 300,
        childStart: 280,
        childEnd: 360,
        span: 200,
      }),
    ).toBe(-60)
  })

  it('leaves a tab that is already visible', () => {
    const inputOffset = -20
    expect(
      panOffsetToReveal({
        offset: inputOffset,
        frameStart: 0,
        frameEnd: 300,
        childStart: 40,
        childEnd: 120,
        span: 200,
      }),
    ).toBe(inputOffset)
  })
})
