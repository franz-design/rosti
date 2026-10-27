import { describe, expect, it } from 'vitest'
import {
  isSameAppDestination,
  PENDING_OPEN_MAX_AGE_MS,
  readFreshOpenPath,
  readStoredOpen,
} from './push-open'

const ORIGIN = 'https://rosti.lesk.fr'
const CHAT_PATH = '/matches/match-1?tab=chat&organizationId=club-1'

describe('readStoredOpen', () => {
  it('keeps a saved address', () => {
    expect(readStoredOpen({ path: CHAT_PATH, savedAt: 10 })).toEqual({
      path: CHAT_PATH,
      savedAt: 10,
    })
  })

  it('rejects a record the page cannot trust', () => {
    expect(readStoredOpen(null)).toBeNull()
    expect(readStoredOpen({ path: CHAT_PATH })).toBeNull()
    expect(readStoredOpen({ path: 12, savedAt: 10 })).toBeNull()
  })
})

describe('readFreshOpenPath', () => {
  it('keeps an address saved when the notification was tapped', () => {
    const actual = readFreshOpenPath(
      { path: CHAT_PATH, savedAt: 1_000 },
      1_000 + PENDING_OPEN_MAX_AGE_MS,
      PENDING_OPEN_MAX_AGE_MS,
    )

    expect(actual).toBe(CHAT_PATH)
  })

  it('drops an address that is too old or leaves the app', () => {
    const now = 1_000 + PENDING_OPEN_MAX_AGE_MS + 1

    expect(
      readFreshOpenPath({ path: CHAT_PATH, savedAt: 1_000 }, now, PENDING_OPEN_MAX_AGE_MS),
    ).toBe(null)
    expect(
      readFreshOpenPath(
        { path: 'https://example.com', savedAt: 1_000 },
        1_000,
        PENDING_OPEN_MAX_AGE_MS,
      ),
    ).toBeNull()
  })
})

describe('isSameAppDestination', () => {
  it('treats the same screen as the same destination', () => {
    const current = `${ORIGIN}/matches/match-1?organizationId=club-1&tab=chat`

    expect(isSameAppDestination(current, CHAT_PATH, ORIGIN)).toBe(true)
  })

  it('sees a different tab as a different destination', () => {
    const current = `${ORIGIN}/matches/match-1?tab=summary&organizationId=club-1`

    expect(isSameAppDestination(current, CHAT_PATH, ORIGIN)).toBe(false)
  })

  it('rejects another site', () => {
    expect(isSameAppDestination('https://example.com/matches/match-1', CHAT_PATH, ORIGIN)).toBe(
      false,
    )
  })
})
