import { describe, expect, it } from 'vitest'
import type { MatchMessage } from '@/lib/rosti-api'
import {
  appendMessageIfMissing,
  buildOptimisticMessage,
  confirmOutgoingMessage,
  mergeOutgoingMessages,
  pruneOutgoingMessages,
  restoreDraftOnSendFailure,
  type OutgoingChatMessage,
} from './optimistic-chat'

function message(id: string, body: string): MatchMessage {
  return {
    id,
    matchId: 'match-1',
    authorId: 'user-1',
    authorName: 'Alex',
    body,
    mentionedUserIds: [],
    createdAt: '2026-10-27T10:00:00.000Z',
  }
}

function outgoing(overrides: Partial<OutgoingChatMessage> = {}): OutgoingChatMessage {
  const clientId = overrides.clientId ?? 'pending-1'
  return {
    clientId,
    matchId: 'match-1',
    markup: 'Salut',
    message: message(clientId, 'Salut'),
    ...overrides,
  }
}

describe('buildOptimisticMessage', () => {
  it('shows the plain text and the mentioned players immediately', () => {
    const actual = buildOptimisticMessage({
      clientId: 'pending-1',
      matchId: 'match-1',
      authorId: 'user-1',
      authorName: 'Alex',
      authorImage: null,
      markup: 'Hey @[Sam](user-2)',
      createdAt: '2026-10-27T10:00:00.000Z',
    })

    expect(actual).toEqual({
      id: 'pending-1',
      matchId: 'match-1',
      authorId: 'user-1',
      authorName: 'Alex',
      authorImage: null,
      body: 'Hey @Sam',
      mentionedUserIds: ['user-2'],
      createdAt: '2026-10-27T10:00:00.000Z',
    })
  })
})

describe('mergeOutgoingMessages', () => {
  it('appends a send the server has not returned yet', () => {
    const pending = outgoing()

    const actual = mergeOutgoingMessages([message('server-1', 'Avant')], [pending], 'match-1')

    expect(actual.map((item) => item.id)).toEqual(['server-1', 'pending-1'])
  })

  it('hides a send once the loaded list contains the saved id', () => {
    const pending = outgoing({ confirmedId: 'server-2' })

    const actual = mergeOutgoingMessages(
      [message('server-1', 'Avant'), message('server-2', 'Salut')],
      [pending],
      'match-1',
    )

    expect(actual.map((item) => item.id)).toEqual(['server-1', 'server-2'])
  })

  it('keeps a confirmed send visible when a reload has not caught up', () => {
    const pending = outgoing({ confirmedId: 'server-2' })

    const actual = mergeOutgoingMessages([message('server-1', 'Avant')], [pending], 'match-1')

    expect(actual.map((item) => item.id)).toEqual(['server-1', 'pending-1'])
  })

  it('ignores a send that belongs to another match', () => {
    const pending = outgoing({ matchId: 'match-2' })

    const actual = mergeOutgoingMessages([], [pending], 'match-1')

    expect(actual).toEqual([])
  })
})

describe('pruneOutgoingMessages', () => {
  it('drops saved sends and sends from another match', () => {
    const saved = confirmOutgoingMessage([outgoing()], 'pending-1', 'server-2')
    const otherMatch = outgoing({ clientId: 'pending-2', matchId: 'match-2' })

    const actual = pruneOutgoingMessages(
      [...saved, otherMatch],
      [message('server-2', 'Salut')],
      'match-1',
    )

    expect(actual).toEqual([])
  })
})

describe('appendMessageIfMissing', () => {
  it('adds the saved message once', () => {
    const saved = message('server-2', 'Salut')

    expect(appendMessageIfMissing([message('server-1', 'Avant')], saved)).toEqual([
      message('server-1', 'Avant'),
      saved,
    ])
    expect(appendMessageIfMissing([saved], saved)).toEqual([saved])
    expect(appendMessageIfMissing(undefined, saved)).toEqual([saved])
  })
})

describe('restoreDraftOnSendFailure', () => {
  it('puts the failed text back only when the field is empty', () => {
    expect(restoreDraftOnSendFailure('', 'Salut')).toBe('Salut')
    expect(restoreDraftOnSendFailure('   ', 'Salut')).toBe('Salut')
    expect(restoreDraftOnSendFailure('Nouveau', 'Salut')).toBe('Nouveau')
  })
})
