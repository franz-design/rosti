/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {
  forgetNotificationTarget,
  readNotificationTarget,
  saveNotificationTarget,
  savePendingOpen,
} from './push-open-store'
import {
  PUSH_OPEN_MESSAGE,
  readAppNotification,
  readNotificationOpenPath,
  type AppNotification,
} from './read-app-notification'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//] }),
)

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const raw = event.data?.text()
  if (!raw) return
  const notification = readAppNotification(raw)
  if (!notification) return
  event.waitUntil(showAppNotification(notification))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data: unknown = event.notification.data
  const tag = event.notification.tag
  event.waitUntil(openNotification({ data, tag }))
})

async function showAppNotification(notification: AppNotification): Promise<void> {
  const tag = crypto.randomUUID()
  if (notification.url) {
    try {
      await saveNotificationTarget(tag, notification.url)
    } catch {
      // The address is also stored on the notification itself.
    }
  }

  await self.registration.showNotification(notification.title, {
    body: notification.body,
    data: { url: notification.url },
    tag,
    icon: '/icons/icon-192.png',
  })
}

async function openNotification(request: { data: unknown; tag: string }): Promise<void> {
  const path = await readOpenPath(request)
  try {
    await forgetNotificationTarget(request.tag)
  } catch {
    // Opening the page does not depend on deleting the saved address.
  }
  if (!path) return
  await openAppPath(path)
}

async function readOpenPath(request: { data: unknown; tag: string }): Promise<string | null> {
  const fromNotification = readNotificationOpenPath(request.data)
  if (fromNotification) return fromNotification
  try {
    return await readNotificationTarget(request.tag)
  } catch {
    return null
  }
}

async function openAppPath(path: string): Promise<void> {
  // iOS brings an already open Home Screen app forward on its current page.
  // navigate() can resolve without moving, and a frozen page can miss a message.
  // The page reads this saved address when it comes back to the foreground.
  try {
    await savePendingOpen(path)
  } catch {
    // The message below can still move the page.
  }

  const destination = new URL(path, self.location.origin).href
  const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  const client = windowClients.find((candidate) => isSameOrigin(candidate.url))
  if (!client) {
    await self.clients.openWindow(destination)
    return
  }

  client.postMessage({ type: PUSH_OPEN_MESSAGE, url: path })
  await navigateClient(client, destination)
  await focusClient(client)
}

function isSameOrigin(clientUrl: string): boolean {
  try {
    return new URL(clientUrl).origin === self.location.origin
  } catch {
    return false
  }
}

async function navigateClient(client: WindowClient, destination: string): Promise<void> {
  if (!('navigate' in client) || typeof client.navigate !== 'function') return
  try {
    await client.navigate(destination)
  } catch {
    // The page routes itself from the saved address or the message.
  }
}

async function focusClient(client: WindowClient): Promise<void> {
  if (!('focus' in client)) return
  try {
    await client.focus()
  } catch {
    // iOS may already be showing this window.
  }
}
