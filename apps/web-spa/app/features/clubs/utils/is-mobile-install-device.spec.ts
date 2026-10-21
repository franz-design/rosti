import { describe, expect, it } from 'vitest'
import { isMobileInstallDevice } from './is-mobile-install-device'

describe('isMobileInstallDevice', () => {
  it('recognises an Android phone', () => {
    expect(
      isMobileInstallDevice({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
        platform: 'Linux armv8l',
        maxTouchPoints: 5,
      }),
    ).toBe(true)
  })

  it('recognises an iPhone and an iPad that reports itself as a Mac', () => {
    expect(
      isMobileInstallDevice({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      }),
    ).toBe(true)
    expect(
      isMobileInstallDevice({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    ).toBe(true)
  })

  it('ignores a desktop computer', () => {
    expect(
      isMobileInstallDevice({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      }),
    ).toBe(false)
  })
})
