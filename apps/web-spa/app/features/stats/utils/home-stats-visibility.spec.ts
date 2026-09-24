import { describe, expect, it } from 'vitest'
import { shouldShowHomeStats } from './home-stats-visibility'

describe('shouldShowHomeStats', () => {
  it('hides stats until more than 2 matches have been played', () => {
    expect(shouldShowHomeStats(0)).toBe(false)
    expect(shouldShowHomeStats(1)).toBe(false)
    expect(shouldShowHomeStats(2)).toBe(false)
    expect(shouldShowHomeStats(3)).toBe(true)
  })
})
