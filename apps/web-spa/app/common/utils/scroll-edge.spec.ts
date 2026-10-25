import { describe, expect, it } from 'vitest'
import { classifyPullMove } from './pull-to-refresh'
import { scrollTopOffEdge, shouldBlockEdgeOverscroll } from './scroll-edge'

describe('scrollTopOffEdge', () => {
  it('leaves a list that cannot scroll', () => {
    expect(scrollTopOffEdge(0, 0)).toBe(0)
    expect(scrollTopOffEdge(0, 1)).toBe(0)
  })

  it('steps in from the top', () => {
    const inputMaxScrollTop = 400
    expect(scrollTopOffEdge(0, inputMaxScrollTop)).toBe(1)
  })

  it('steps in from the bottom', () => {
    const inputMaxScrollTop = 400
    expect(scrollTopOffEdge(inputMaxScrollTop, inputMaxScrollTop)).toBe(399)
  })

  it('leaves a position in the middle', () => {
    const inputScrollTop = 40
    expect(scrollTopOffEdge(inputScrollTop, 400)).toBe(inputScrollTop)
  })
})

describe('shouldBlockEdgeOverscroll', () => {
  it('blocks a downward drag at the top before a pull indicator would show', () => {
    const input = { deltaX: 1, deltaY: 4, scrollTop: 0, maxScrollTop: 800 }

    expect(classifyPullMove({ ...input, isPulling: false })).toBe('wait')
    expect(shouldBlockEdgeOverscroll(input)).toBe(true)
  })

  it('blocks the same drag when the list sits one pixel in from the top', () => {
    expect(
      shouldBlockEdgeOverscroll({ deltaX: 0, deltaY: 4, scrollTop: 1, maxScrollTop: 400 }),
    ).toBe(true)
  })

  it('lets the page scroll up from the top', () => {
    expect(
      shouldBlockEdgeOverscroll({ deltaX: 0, deltaY: -20, scrollTop: 1, maxScrollTop: 400 }),
    ).toBe(false)
  })

  it('lets a sideways drag through', () => {
    expect(
      shouldBlockEdgeOverscroll({ deltaX: 12, deltaY: 4, scrollTop: 0, maxScrollTop: 400 }),
    ).toBe(false)
  })

  it('lets a downward drag leave the bottom', () => {
    expect(
      shouldBlockEdgeOverscroll({ deltaX: 0, deltaY: 10, scrollTop: 399, maxScrollTop: 400 }),
    ).toBe(false)
  })

  it('blocks an upward drag at the bottom', () => {
    expect(
      shouldBlockEdgeOverscroll({ deltaX: 0, deltaY: -6, scrollTop: 400, maxScrollTop: 400 }),
    ).toBe(true)
  })

  it('blocks every vertical drag on a page that does not scroll', () => {
    expect(shouldBlockEdgeOverscroll({ deltaX: 0, deltaY: 8, scrollTop: 0, maxScrollTop: 0 })).toBe(
      true,
    )
    expect(
      shouldBlockEdgeOverscroll({ deltaX: 0, deltaY: -8, scrollTop: 0, maxScrollTop: 0 }),
    ).toBe(true)
  })
})
