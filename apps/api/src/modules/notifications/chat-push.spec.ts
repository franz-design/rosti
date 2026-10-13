import { chatPush } from './chat-push'

const INPUT = {
  organizationId: '11111111-1111-4111-8111-111111111111',
  matchId: '22222222-2222-4222-8222-222222222222',
  matchTitle: 'Match du jeudi',
  authorName: 'Alex',
  body: 'On se retrouve à 19h ?',
}

describe('chatPush', () => {
  it('writes a short mention that opens the match chat', () => {
    const actual = chatPush({ ...INPUT, isMention: true })

    expect(actual).toEqual({
      title: 'Alex te mentionne',
      body: 'On se retrouve à 19h ?',
      event: 'chat_mention',
      organizationId: INPUT.organizationId,
      matchId: INPUT.matchId,
      url: `/matches/${INPUT.matchId}?tab=chat&organizationId=${INPUT.organizationId}`,
    })
  })

  it('uses the author as the title for a normal message', () => {
    const actual = chatPush({ ...INPUT, isMention: false })

    expect(actual.title).toBe('Alex')
    expect(actual.event).toBe('chat_message')
    expect(actual.body).toBe('On se retrouve à 19h ?')
  })

  it('falls back to the match title when the message is empty', () => {
    const actual = chatPush({ ...INPUT, isMention: false, body: '   ' })

    expect(actual.body).toBe('Match du jeudi')
  })

  it('keeps the lock-screen text on one short line', () => {
    const actual = chatPush({
      ...INPUT,
      isMention: false,
      authorName: '  Alex\nMartin  ',
      body: `salut ${'a'.repeat(200)}`,
    })

    expect(actual.title).toBe('Alex Martin')
    expect(actual.body).toHaveLength(140)
    expect(actual.body.startsWith('salut ')).toBe(true)
  })
})
