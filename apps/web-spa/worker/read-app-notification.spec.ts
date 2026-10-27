import { describe, expect, it } from 'vitest'
import {
  readAppNotification,
  readAppPath,
  readNotificationOpenPath,
  readPushOpenMessage,
} from './read-app-notification'

describe('readAppNotification', () => {
  it('reads a push payload and keeps the extra fields', () => {
    const actual = readAppNotification(
      JSON.stringify({
        title: 'Match on Thursday',
        body: 'Say if you are coming.',
        event: 'match_invite',
        organizationId: 'club-1',
        matchId: 'match-1',
        url: '/matches/match-1',
      }),
    )

    expect(actual).toMatchObject({
      title: 'Match on Thursday',
      body: 'Say if you are coming.',
      url: '/matches/match-1',
      data: {
        event: 'match_invite',
        organizationId: 'club-1',
        matchId: 'match-1',
      },
    })
  })

  it('drops a payload the app cannot show', () => {
    expect(readAppNotification('not json')).toBeNull()
    expect(readAppNotification('[]')).toBeNull()
    expect(readAppNotification('{"event":"match_invite"}')).toBeNull()
  })

  it('uses the app name when the title is missing', () => {
    expect(readAppNotification('{"body":"Score reminder"}')).toMatchObject({
      title: 'Rösti',
      body: 'Score reminder',
      url: null,
    })
  })
})

describe('readAppPath', () => {
  it('keeps an in-app path', () => {
    expect(readAppPath('/matches/1?tab=chat')).toBe('/matches/1?tab=chat')
  })

  it('rejects anything that could leave the app', () => {
    expect(readAppPath('https://example.com')).toBeNull()
    expect(readAppPath('//example.com')).toBeNull()
    expect(readAppPath('matches/1')).toBeNull()
    expect(readAppPath(null)).toBeNull()
  })
})

describe('readNotificationOpenPath', () => {
  it('reads the address stored on the notification', () => {
    expect(readNotificationOpenPath({ url: '/matches/1?tab=chat' })).toBe('/matches/1?tab=chat')
  })

  it('reads an address the phone kept as text', () => {
    expect(readNotificationOpenPath('{"url":"/matches/1?tab=stats"}')).toBe('/matches/1?tab=stats')
  })

  it('rejects an address outside the app', () => {
    expect(readNotificationOpenPath({ url: 'https://example.com' })).toBeNull()
    expect(readNotificationOpenPath(null)).toBeNull()
  })
})

describe('readPushOpenMessage', () => {
  it('reads the address sent to an open page', () => {
    expect(readPushOpenMessage({ type: 'rosti-open', url: '/matches/1?tab=chat' })).toBe(
      '/matches/1?tab=chat',
    )
  })

  it('ignores another message', () => {
    expect(readPushOpenMessage({ type: 'other', url: '/matches/1' })).toBeNull()
    expect(readPushOpenMessage(null)).toBeNull()
  })
})
