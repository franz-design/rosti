import { rostiApi } from '@/lib/rosti-api'

const INSTALLATION_KEY = 'rosti.pushInstallationId'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type BrowserPushState =
  | 'unsupported'
  | 'no-worker'
  | 'blocked'
  | 'not-asked'
  | 'allowed'
  | 'failed'

export function readPushInstallationId(): string | null {
  const existing = localStorage.getItem(INSTALLATION_KEY)
  if (!existing || !UUID_PATTERN.test(existing)) return null
  return existing
}

export function getOrCreatePushInstallationId(): string {
  const existing = readPushInstallationId()
  if (existing) return existing
  const created = crypto.randomUUID()
  localStorage.setItem(INSTALLATION_KEY, created)
  return created
}

export function shouldExplainIosHomeScreen(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  if (isInstalledPwa()) return false
  return isIosBrowser()
}

export function isInstalledPwa(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  return isStandaloneDisplay()
}

export function readConfiguredWebPushPublicKey(): string | null {
  const value = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

export async function waitForInstalledPushRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!canUseWebPush()) return null
  const existing = await navigator.serviceWorker.getRegistration()
  if (existing) return existing
  if (!import.meta.env.PROD) return null
  return navigator.serviceWorker.ready
}

export async function readBrowserPushState(): Promise<BrowserPushState> {
  if (!canUseWebPush()) return 'unsupported'
  if (Notification.permission === 'denied') return 'blocked'
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return 'no-worker'
  if (Notification.permission !== 'granted') return 'not-asked'
  const subscription = await registration.pushManager.getSubscription()
  return subscription ? 'allowed' : 'not-asked'
}

export async function enableWebPushOnThisBrowser(publicKey: string): Promise<BrowserPushState> {
  if (!canUseWebPush()) return 'unsupported'
  if (Notification.permission === 'denied') return 'blocked'

  // Ask before any other await so the browser still treats this as the user's tap.
  const permissionPromise = Notification.requestPermission()
  const registrationPromise = navigator.serviceWorker.getRegistration()
  const permission = await permissionPromise
  if (permission === 'denied') return 'blocked'
  if (permission !== 'granted') return 'not-asked'

  const registration = await registrationPromise
  if (!registration) return 'no-worker'

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
    const json = subscription.toJSON()
    if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return 'failed'
    await rostiApi.registerWebPush({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      installationId: getOrCreatePushInstallationId(),
    })
    return 'allowed'
  } catch {
    return 'failed'
  }
}

export async function removeThisBrowserPushSubscription(): Promise<void> {
  const installationId = readPushInstallationId()
  if (!installationId) return
  await rostiApi.removeWebPush(installationId)
}

function canUseWebPush(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function isIosBrowser(): boolean {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

function isStandaloneDisplay(): boolean {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return window.matchMedia('(display-mode: standalone)').matches || standalone
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index)
  }
  return output
}
