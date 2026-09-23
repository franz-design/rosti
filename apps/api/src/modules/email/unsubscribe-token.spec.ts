import { readUnsubscribeToken, signUnsubscribeToken } from './unsubscribe-token'

const SECRET = 'test-secret'
const USER_ID = '4f3b1c2a-8d7e-4a6b-9c0d-1e2f3a4b5c6d'

describe('unsubscribe token', () => {
  it('round-trips a user id', () => {
    const token = signUnsubscribeToken(USER_ID, SECRET)

    expect(readUnsubscribeToken(token, SECRET)).toBe(USER_ID)
  })

  it('rejects a token signed with another secret', () => {
    const token = signUnsubscribeToken(USER_ID, SECRET)

    expect(readUnsubscribeToken(token, 'other-secret')).toBeNull()
  })

  it('rejects a tampered payload', () => {
    const token = signUnsubscribeToken(USER_ID, SECRET)
    const [, , signature] = token.split('.')
    const swapped = `v1.${Buffer.from('not-a-user', 'utf8').toString('base64url')}.${signature}`

    expect(readUnsubscribeToken(swapped, SECRET)).toBeNull()
  })
})
