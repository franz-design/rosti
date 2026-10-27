export const PUSH_OPEN_MESSAGE = 'rosti-open'

export interface AppNotification {
  title: string
  body: string
  url: string | null
  data: Record<string, unknown>
}

const MAX_TITLE_LENGTH = 120
const MAX_BODY_LENGTH = 240

export function readAppNotification(raw: string): AppNotification | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

  const record = parsed as Record<string, unknown>
  const title = readText(record.title, MAX_TITLE_LENGTH)
  const body = readText(record.body, MAX_BODY_LENGTH)
  if (!title && !body) return null

  return {
    title: title || 'Rösti',
    body,
    url: readAppPath(record.url),
    data: record,
  }
}

export function readAppPath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (trimmed.includes('\\') || trimmed.includes('://')) return null
  return trimmed
}

export function readNotificationOpenPath(data: unknown): string | null {
  if (typeof data === 'string') return readStringNotificationPath(data)
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('url' in data)) return null
  return readAppPath(data.url)
}

export function readPushOpenMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  if (!('type' in data) || !('url' in data)) return null
  if (data.type !== PUSH_OPEN_MESSAGE) return null
  return readAppPath(data.url)
}

function readStringNotificationPath(data: string): string | null {
  const direct = readAppPath(data)
  if (direct) return direct
  try {
    const parsed: unknown = JSON.parse(data)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !('url' in parsed)) {
      return null
    }
    return readAppPath(parsed.url)
  } catch {
    return null
  }
}

function readText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}
