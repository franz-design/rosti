import { describe, expect, it } from 'vitest'
import {
  PUSH_PROMPT_RETRY_MS,
  readPushPromptDismissedAt,
  rememberPushPromptDismissed,
  shouldShowInstalledPushPrompt,
} from './installed-push-prompt'

const userId = 'user-1'
const now = 1_700_000_000_000

describe('shouldShowInstalledPushPrompt', () => {
  it('shows on the first open of the installed app', () => {
    expect(
      shouldShowInstalledPushPrompt({
        isInstalled: true,
        browserState: 'not-asked',
        dismissedAt: null,
        now,
        hasPublicKey: true,
      }),
    ).toBe(true)
  })

  it('stays hidden in a browser tab, after a grant, and without a key', () => {
    expect(
      shouldShowInstalledPushPrompt({
        isInstalled: false,
        browserState: 'not-asked',
        dismissedAt: null,
        now,
        hasPublicKey: true,
      }),
    ).toBe(false)
    expect(
      shouldShowInstalledPushPrompt({
        isInstalled: true,
        browserState: 'allowed',
        dismissedAt: null,
        now,
        hasPublicKey: true,
      }),
    ).toBe(false)
    expect(
      shouldShowInstalledPushPrompt({
        isInstalled: true,
        browserState: 'not-asked',
        dismissedAt: null,
        now,
        hasPublicKey: false,
      }),
    ).toBe(false)
  })

  it('waits seven days after the user chooses later', () => {
    expect(
      shouldShowInstalledPushPrompt({
        isInstalled: true,
        browserState: 'not-asked',
        dismissedAt: now - PUSH_PROMPT_RETRY_MS + 1,
        now,
        hasPublicKey: true,
      }),
    ).toBe(false)
    expect(
      shouldShowInstalledPushPrompt({
        isInstalled: true,
        browserState: 'not-asked',
        dismissedAt: now - PUSH_PROMPT_RETRY_MS,
        now,
        hasPublicKey: true,
      }),
    ).toBe(true)
  })
})

describe('push prompt dismissal storage', () => {
  it('remembers the dismissal for one account', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value)
      },
    }

    expect(readPushPromptDismissedAt(userId, storage)).toBeNull()
    rememberPushPromptDismissed(userId, now, storage)
    expect(readPushPromptDismissedAt(userId, storage)).toBe(now)
    expect(readPushPromptDismissedAt('user-2', storage)).toBeNull()
  })
})
