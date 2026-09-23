import { createHmac, timingSafeEqual } from 'node:crypto'
import { config } from '../../config/env.config'

const TOKEN_VERSION = 'v1'
const USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Signs a user id so an email can link to unsubscribe without a login.
 * The link stays valid: people click old emails.
 */
export function signUnsubscribeToken(userId: string, secret: string): string {
  const payload = Buffer.from(userId, 'utf8').toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${TOKEN_VERSION}.${payload}.${signature}`
}

/**
 * Returns the user id when the token was signed with this secret.
 */
export function readUnsubscribeToken(token: string, secret: string): string | null {
  const [version, payload, signature, extra] = token.split('.')
  if (version !== TOKEN_VERSION || !payload || !signature || extra) return null

  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null

  const userId = Buffer.from(payload, 'base64url').toString('utf8')
  if (!USER_ID_PATTERN.test(userId)) return null
  return userId
}

/**
 * Public page that turns notification emails off for one user.
 */
export function buildUnsubscribeUrl(userId: string): string {
  const token = signUnsubscribeToken(userId, config.betterAuth.secret)
  const base = config.api.baseUrl.replace(/\/$/, '')
  return `${base}/api/notifications/unsubscribe?token=${encodeURIComponent(token)}`
}
