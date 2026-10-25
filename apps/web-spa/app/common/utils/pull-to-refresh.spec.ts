import type { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  PULL_HOLD_PX,
  PULL_MAX_PX,
  PULL_MIN_VISIBLE_MS,
  PULL_THRESHOLD_PX,
  classifyPullMove,
  followFinger,
  nextPullOnRelease,
  refreshMountedQueries,
} from './pull-to-refresh'

describe('followFinger', () => {
  it('stays put when the finger moves up', () => {
    expect(followFinger(0)).toBe(0)
    expect(followFinger(-24)).toBe(0)
  })

  it('follows part of a downward drag', () => {
    const inputDeltaY = 80
    expect(followFinger(inputDeltaY)).toBe(60)
  })

  it('caps the travel', () => {
    expect(followFinger(10_000)).toBe(PULL_MAX_PX)
  })
})

describe('classifyPullMove', () => {
  it('waits until the finger has clearly moved', () => {
    expect(classifyPullMove({ deltaX: 2, deltaY: 4, scrollTop: 0, isPulling: false })).toBe('wait')
  })

  it('starts a pull from the top when the drag is downward', () => {
    expect(classifyPullMove({ deltaX: 2, deltaY: 20, scrollTop: 0, isPulling: false })).toBe('pull')
  })

  it('lets a sideways drag scroll instead', () => {
    expect(classifyPullMove({ deltaX: 30, deltaY: 12, scrollTop: 0, isPulling: false })).toBe(
      'ignore',
    )
  })

  it('lets an upward drag scroll the page', () => {
    expect(classifyPullMove({ deltaX: 0, deltaY: -20, scrollTop: 0, isPulling: false })).toBe(
      'ignore',
    )
  })

  it('ignores a drag that starts below the top', () => {
    expect(classifyPullMove({ deltaX: 0, deltaY: 40, scrollTop: 24, isPulling: false })).toBe(
      'ignore',
    )
  })

  it('keeps following while the finger is still below the start', () => {
    expect(classifyPullMove({ deltaX: 40, deltaY: 16, scrollTop: 0, isPulling: true })).toBe('pull')
  })

  it('cancels the pull when the page is no longer at the top', () => {
    expect(classifyPullMove({ deltaX: 0, deltaY: 40, scrollTop: 8, isPulling: true })).toBe(
      'ignore',
    )
  })
})

describe('nextPullOnRelease', () => {
  it('refreshes once the pull passes the threshold', () => {
    expect(nextPullOnRelease(PULL_THRESHOLD_PX)).toEqual({
      refresh: true,
      distance: PULL_HOLD_PX,
    })
  })

  it('snaps back when the pull is too short', () => {
    const inputDistance = PULL_THRESHOLD_PX - 1
    expect(nextPullOnRelease(inputDistance)).toEqual({ refresh: false, distance: 0 })
  })
})

describe('refreshMountedQueries', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('refetches the queries on screen and resolves when one fails', async () => {
    vi.useFakeTimers()
    const refetchQueries = vi.fn(() => Promise.reject(new Error('offline')))
    const queryClient = { refetchQueries } as unknown as QueryClient

    const pending = refreshMountedQueries(queryClient)
    const settled = expect(pending).resolves.toBeUndefined()
    await vi.advanceTimersByTimeAsync(PULL_MIN_VISIBLE_MS)

    await settled
    expect(refetchQueries).toHaveBeenCalledWith({ type: 'active' })
  })
})
