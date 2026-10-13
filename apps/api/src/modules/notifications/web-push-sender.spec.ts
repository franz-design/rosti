import { deliverWebPush, readWebPushStatusCode } from './web-push-sender'

const REQUEST = {
  vapid: {
    subject: 'mailto:noreply@lesk.fr',
    publicKey: 'public',
    privateKey: 'private',
  },
  subscription: {
    endpoint: 'https://push.example/subscription',
    p256dh: 'p256dh',
    auth: 'auth',
  },
  payload: '{"title":"Alex"}',
}

describe('deliverWebPush', () => {
  it('reports a successful send', async () => {
    const actual = await deliverWebPush({ ...REQUEST, send: async () => undefined })

    expect(actual).toBe('sent')
  })

  it('treats a removed subscription as gone', async () => {
    const actual = await deliverWebPush({
      ...REQUEST,
      send: async () => {
        throw Object.assign(new Error('gone'), { statusCode: 410 })
      },
    })

    expect(actual).toBe('gone')
  })

  it('keeps the subscription when the push service fails for now', async () => {
    const actual = await deliverWebPush({
      ...REQUEST,
      send: async () => {
        throw Object.assign(new Error('busy'), { statusCode: 503 })
      },
    })

    expect(actual).toBe('failed')
  })
})

describe('readWebPushStatusCode', () => {
  it('reads the status from a push error', () => {
    expect(readWebPushStatusCode({ statusCode: 404 })).toBe(404)
    expect(readWebPushStatusCode(new Error('network'))).toBeNull()
    expect(readWebPushStatusCode(null)).toBeNull()
  })
})
