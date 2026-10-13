import { sendNotification } from 'web-push'

const PUSH_TIMEOUT_MS = 3_000
const PUSH_TTL_SECONDS = 12 * 60 * 60

export interface VapidCredentials {
  subject: string
  publicKey: string
  privateKey: string
}

export interface WebPushTarget {
  endpoint: string
  p256dh: string
  auth: string
}

interface WebPushRequest {
  vapid: VapidCredentials
  subscription: WebPushTarget
  payload: string
  timeoutMs: number
  ttlSeconds: number
}

export async function deliverWebPush(input: {
  vapid: VapidCredentials
  subscription: WebPushTarget
  payload: string
  send?: (request: WebPushRequest) => Promise<void>
}): Promise<'sent' | 'gone' | 'failed'> {
  const send = input.send ?? sendWithWebPush
  try {
    await send({
      vapid: input.vapid,
      subscription: input.subscription,
      payload: input.payload,
      timeoutMs: PUSH_TIMEOUT_MS,
      ttlSeconds: PUSH_TTL_SECONDS,
    })
    return 'sent'
  } catch (err) {
    const statusCode = readWebPushStatusCode(err)
    if (statusCode === 404 || statusCode === 410) return 'gone'
    return 'failed'
  }
}

export function readWebPushStatusCode(err: unknown): number | null {
  if (!err || typeof err !== 'object' || !('statusCode' in err)) return null
  const statusCode = err.statusCode
  return typeof statusCode === 'number' ? statusCode : null
}

async function sendWithWebPush(request: WebPushRequest): Promise<void> {
  await sendNotification(
    {
      endpoint: request.subscription.endpoint,
      keys: {
        p256dh: request.subscription.p256dh,
        auth: request.subscription.auth,
      },
    },
    request.payload,
    {
      vapidDetails: request.vapid,
      timeout: request.timeoutMs,
      TTL: request.ttlSeconds,
    },
  )
}
