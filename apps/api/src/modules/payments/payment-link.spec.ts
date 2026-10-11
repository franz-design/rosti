import { describe, expect, it } from 'vitest'
import { buildPaymentUrl } from './payment-link'

describe('buildPaymentUrl', () => {
  it('appends the amount on a paypal.me link', () => {
    const actual = buildPaymentUrl('https://paypal.me/alex', 650)

    expect(actual).toBe('https://paypal.me/alex/6.50EUR')
  })

  it('appends the amount on a paypal.com/paypalme link', () => {
    const actual = buildPaymentUrl('https://www.paypal.com/paypalme/alex', 600)

    expect(actual).toBe('https://www.paypal.com/paypalme/alex/6EUR')
  })

  it('replaces an amount already present on the link', () => {
    const actual = buildPaymentUrl('https://paypal.me/alex/5EUR', 1250)

    expect(actual).toBe('https://paypal.me/alex/12.50EUR')
  })

  it('leaves a non-PayPal link unchanged', () => {
    const actual = buildPaymentUrl('https://lydia.me/collect/abc', 650)

    expect(actual).toBe('https://lydia.me/collect/abc')
  })

  it('returns nothing when there is no link or the amount is zero', () => {
    expect(buildPaymentUrl(null, 650)).toBeUndefined()
    expect(buildPaymentUrl('https://paypal.me/alex', 0)).toBeUndefined()
  })
})
