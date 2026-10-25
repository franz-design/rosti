import { describe, expect, it } from 'vitest'
import { resolveSeasonsBackTarget, SEASONS_BACK_FALLBACK } from './seasons-back'

describe('resolveSeasonsBackTarget', () => {
  it('goes back when the history has a previous screen', () => {
    expect(resolveSeasonsBackTarget(1)).toBe(-1)
  })

  it('opens club settings when this screen is the first one', () => {
    expect(resolveSeasonsBackTarget(0)).toBe(SEASONS_BACK_FALLBACK)
    expect(resolveSeasonsBackTarget(undefined)).toBe(SEASONS_BACK_FALLBACK)
  })
})
