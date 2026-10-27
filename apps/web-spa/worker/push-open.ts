import { readAppPath } from './read-app-notification'

export const PENDING_OPEN_MAX_AGE_MS = 60_000
export const NOTIFICATION_TARGET_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
export const PENDING_OPEN_RETRY_DELAYS_MS = [300, 1500, 3000] as const

export interface PendingOpenRecord {
  path: string
  savedAt: number
}

export function readStoredOpen(value: unknown): PendingOpenRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (typeof record.path !== 'string' || typeof record.savedAt !== 'number') return null
  if (!Number.isFinite(record.savedAt)) return null
  return { path: record.path, savedAt: record.savedAt }
}

export function readFreshOpenPath(
  record: PendingOpenRecord | null,
  now: number,
  maxAgeMs: number,
): string | null {
  if (!record) return null
  if (now - record.savedAt > maxAgeMs) return null
  return readAppPath(record.path)
}

export function isSameAppDestination(currentHref: string, path: string, origin: string): boolean {
  const current = readDestination(currentHref, origin)
  const next = readDestination(path, origin)
  if (!current || !next) return false
  if (current.origin !== next.origin) return false
  if (current.pathname !== next.pathname) return false
  return canonicalSearch(current) === canonicalSearch(next)
}

function readDestination(value: string, origin: string): URL | null {
  try {
    return new URL(value, origin)
  } catch {
    return null
  }
}

function canonicalSearch(url: URL): string {
  return [...url.searchParams.entries()]
    .sort(compareSearchEntry)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

function compareSearchEntry(left: [string, string], right: [string, string]): number {
  const byKey = left[0].localeCompare(right[0])
  if (byKey !== 0) return byKey
  return left[1].localeCompare(right[1])
}
