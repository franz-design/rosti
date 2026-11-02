/**
 * Fills the amount on a PayPal.me link. Any other link is returned unchanged.
 * Omits the currency code: the PayPal mobile app drops the amount when a
 * currency suffix is present (e.g. 3.75EUR). PayPal then uses the recipient's
 * primary currency.
 * Example: https://paypal.me/alex and 650 cents becomes https://paypal.me/alex/6.50
 */
export function buildPaymentUrl(
  link: string | null | undefined,
  amountCents: number,
): string | undefined {
  const trimmed = link?.trim()
  if (!trimmed || amountCents <= 0) return undefined

  let url: URL
  try {
    url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
  } catch {
    return trimmed
  }

  const host = url.hostname.replace(/^www\./, '')
  const segments = url.pathname.split('/').filter((segment) => segment.length > 0)
  const isPaypalMeHost = host === 'paypal.me'
  const isPaypalMePath = host === 'paypal.com' && segments[0] === 'paypalme'
  if (!isPaypalMeHost && !isPaypalMePath) return trimmed

  // paypal.me/{user} or paypal.com/paypalme/{user} — drop any prior amount/currency.
  const userSegments = isPaypalMeHost ? segments.slice(0, 1) : segments.slice(0, 2)
  if (userSegments.length < (isPaypalMeHost ? 1 : 2)) return trimmed


  url.pathname = `/${[...userSegments, formatPaypalAmount(amountCents)].join('/')}`
  return url.toString()
}

function formatPaypalAmount(amountCents: number): string {
  const euros = Math.trunc(amountCents / 100)
  const cents = Math.abs(amountCents % 100)
  if (cents === 0) return String(euros)
  return `${euros}.${String(cents).padStart(2, '0')}`
}
