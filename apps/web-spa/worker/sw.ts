/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { readAppNotification, readAppPath } from './read-app-notification'

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

  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      data: notification.data,
      icon: '/icons/icon-192.png',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const path = readAppPath(readNotificationUrl(event.notification.data))
  if (!path) return
  event.waitUntil(openAppPath(path))
})

function readNotificationUrl(data: unknown): unknown {
  if (!data || typeof data !== 'object' || !('url' in data)) return null
  return data.url
}

async function openAppPath(path: string): Promise<void> {
  const destination = new URL(path, self.location.origin).href
  const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

  for (const client of windowClients) {
    if (new URL(client.url).origin !== self.location.origin) continue
    if (!('focus' in client)) continue
    await client.focus()
    if ('navigate' in client && typeof client.navigate === 'function') {
      await client.navigate(destination)
    }
    return
  }

  await self.clients.openWindow(destination)
}
