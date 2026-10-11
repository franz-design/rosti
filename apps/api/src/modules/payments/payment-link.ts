const PAYPAL_AMOUNT = /^(\d+(?:\.\d+)?)[A-Za-z]{3}$/

/**
 * Fills the amount on a PayPal.me link. Any other link is returned unchanged.
 * Example: https://paypal.me/alex and 650 cents becomes https://paypal.me/alex/6.50EUR
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

  const amount = `${formatPaypalAmount(amountCents)}EUR`
  const last = segments.at(-1)
  if (last && PAYPAL_AMOUNT.test(last)) {
    segments[segments.length - 1] = amount
  } else {
    segments.push(amount)
  }
  url.pathname = `/${segments.join('/')}`
  return url.toString()
}

function formatPaypalAmount(amountCents: number): string {
  const euros = Math.trunc(amountCents / 100)
  const cents = Math.abs(amountCents % 100)
  if (cents === 0) return String(euros)
  return `${euros}.${String(cents).padStart(2, '0')}`
}
