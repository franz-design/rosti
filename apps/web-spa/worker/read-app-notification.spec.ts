import { describe, expect, it } from 'vitest'
import { readAppNotification, readAppPath } from './read-app-notification'

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
