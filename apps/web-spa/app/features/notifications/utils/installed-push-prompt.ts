import type { BrowserPushState } from '@/lib/web-push'

const DISMISSED_AT_PREFIX = 'rosti.pushPromptDismissedAt.'
export const PUSH_PROMPT_RETRY_MS = 7 * 24 * 60 * 60 * 1000

interface PromptStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function readPushPromptDismissedAt(
  userId: string,
  storage: Pick<PromptStorage, 'getItem'> = localStorage,
): number | null {
  const raw = storage.getItem(dismissedAtKey(userId))
  if (!raw) return null
  const value = Number(raw)
  if (!Number.isFinite(value)) return null
  return value
}

export function rememberPushPromptDismissed(
  userId: string,
  now: number = Date.now(),
  storage: Pick<PromptStorage, 'setItem'> = localStorage,
): void {
  storage.setItem(dismissedAtKey(userId), String(now))
}

export function shouldShowInstalledPushPrompt(input: {
  isInstalled: boolean
  browserState: BrowserPushState
  dismissedAt: number | null
  now: number
  hasPublicKey: boolean
}): boolean {
  if (!input.isInstalled || !input.hasPublicKey) return false
  if (input.browserState !== 'not-asked') return false
  if (input.dismissedAt === null) return true
  return input.now - input.dismissedAt >= PUSH_PROMPT_RETRY_MS
}

function dismissedAtKey(userId: string): string {
  return `${DISMISSED_AT_PREFIX}${userId}`
}
