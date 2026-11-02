import { describe, expect, it, vi } from 'vitest'
import { shouldUseSystemShare } from './share-match-text'

describe('shouldUseSystemShare', () => {
  it('is false when share is unavailable', () => {
    expect(shouldUseSystemShare(undefined, () => true)).toBe(false)
  })

  it('is false on fine-pointer devices even when share exists', () => {
    expect(shouldUseSystemShare(vi.fn(), () => false)).toBe(false)
  })

  it('is true on coarse-pointer devices when share exists', () => {
    expect(shouldUseSystemShare(vi.fn(), () => true)).toBe(true)
  })
})
