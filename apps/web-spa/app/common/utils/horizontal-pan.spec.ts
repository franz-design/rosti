import { describe, expect, it } from 'vitest'
import { clampPanOffset, panOffsetForTabCenter, panOffsetToCenter, panOffsetToReveal } from './horizontal-pan'

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

describe('panOffsetToCenter', () => {
  it('moves a tab on the right into the middle', () => {
    expect(
      panOffsetToCenter({
        offset: 0,
        frameStart: 0,
        frameEnd: 300,
        childStart: 280,
        childEnd: 360,
        span: 200,
      }),
    ).toBe(-170)
  })

  it('leaves a tab that is already centered', () => {
    const inputOffset = -40
    expect(
      panOffsetToCenter({
        offset: inputOffset,
        frameStart: 0,
        frameEnd: 300,
        childStart: 110,
        childEnd: 190,
        span: 200,
      }),
    ).toBe(inputOffset)
  })

  it('keeps the first tab against the start of the frame', () => {
    expect(
      panOffsetToCenter({
        offset: -40,
        frameStart: 0,
        frameEnd: 300,
        childStart: 0,
        childEnd: 80,
        span: 200,
      }),
    ).toBe(0)
  })

  it('pins the last tab to the end of the frame', () => {
    expect(
      panOffsetToCenter({
        offset: 0,
        frameStart: 0,
        frameEnd: 300,
        childStart: 380,
        childEnd: 500,
        span: 200,
      }),
    ).toBe(-200)
  })
})

describe('panOffsetForTabCenter', () => {
  it('centers a tab measured from the track', () => {
    expect(panOffsetForTabCenter(40, 300, 200)).toBe(0)
    expect(panOffsetForTabCenter(440, 300, 200)).toBe(-200)
    expect(panOffsetForTabCenter(150, 300, 200)).toBe(0)
    expect(panOffsetForTabCenter(250, 300, 400)).toBe(-100)
  })

  it('does not slide a row that already fits', () => {
    expect(panOffsetForTabCenter(40, 300, 0)).toBe(0)
  })
})
