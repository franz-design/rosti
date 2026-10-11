/** Parses a euro amount such as "30" or "12,50". Empty means 0. Invalid input returns null. */
export function eurosToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return 0
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}

/** Shows cents in an input, using a comma for the cents. */
export function centsToEuroInput(cents: number): string {
  const euros = Math.trunc(cents / 100)
  const rest = Math.abs(cents % 100)
  if (rest === 0) return String(euros)
  return `${euros},${String(rest).padStart(2, '0')}`
}

export function formatEuro(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
