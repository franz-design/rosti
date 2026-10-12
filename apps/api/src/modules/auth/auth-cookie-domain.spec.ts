import { describe, expect, it } from 'vitest'
import { resolveAuthCookieDomain } from './auth-cookie-domain'

describe('resolveAuthCookieDomain', () => {
  it('shares the cookie on the parent of the production hosts', () => {
    expect(
      resolveAuthCookieDomain('https://rosti-api.lesk.fr', 'https://rosti.lesk.fr'),
    ).toBe('lesk.fr')
  })

  it('uses the longest shared parent when one host is nested', () => {
    expect(
      resolveAuthCookieDomain('https://api.rosti.lesk.fr', 'https://rosti.lesk.fr'),
    ).toBe('rosti.lesk.fr')
  })

  it('keeps a host-only cookie when both apps are on localhost', () => {
    expect(
      resolveAuthCookieDomain('http://localhost:3000', 'http://localhost:5174'),
    ).toBeUndefined()
  })

  it('does not invent a parent for unrelated hosts', () => {
    expect(resolveAuthCookieDomain('https://api.example.com', 'https://app.other.com')).toBe(
      undefined,
    )
  })

  it('does not set a domain for IP hosts', () => {
    expect(resolveAuthCookieDomain('http://146.59.199.200:3000', 'http://10.0.0.2:5174')).toBe(
      undefined,
    )
  })

  it('ignores values that are not URLs', () => {
    expect(resolveAuthCookieDomain('not a url', 'https://rosti.lesk.fr')).toBeUndefined()
  })
})
