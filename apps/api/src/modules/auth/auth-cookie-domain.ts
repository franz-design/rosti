/**
 * Parent domain for the session cookie when the web app and the API
 * are on different hosts of the same site.
 *
 * A host-only cookie on the API is dropped by WebKit (Chrome on iPhone):
 * the user never opens the API host directly. Sharing the cookie on the
 * common parent makes it first-party for the site they do open.
 * Same host, as in local development, keeps the default host-only cookie.
 */
export function resolveAuthCookieDomain(
  apiBaseUrl: string,
  webAppUrl: string,
): string | undefined {
  const apiHost = readHostname(apiBaseUrl)
  const webHost = readHostname(webAppUrl)
  if (!apiHost || !webHost || apiHost === webHost) return undefined
  if (isIpAddress(apiHost) || isIpAddress(webHost)) return undefined

  const shared = sharedParentLabels(apiHost, webHost)
  if (shared.length < 2) return undefined
  return shared.join('.')
}

function readHostname(value: string): string | undefined {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return undefined
  }
}

function isIpAddress(hostname: string): boolean {
  if (hostname.includes(':')) return true
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
}

function sharedParentLabels(left: string, right: string): string[] {
  const leftLabels = left.split('.')
  const rightLabels = right.split('.')
  const shared: string[] = []

  while (leftLabels.length > 0 && rightLabels.length > 0) {
    const leftLabel = leftLabels.pop()
    const rightLabel = rightLabels.pop()
    if (leftLabel !== rightLabel || !leftLabel) break
    shared.unshift(leftLabel)
  }

  return shared
}
