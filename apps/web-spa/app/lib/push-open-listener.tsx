import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { isSameAppDestination, PENDING_OPEN_RETRY_DELAYS_MS } from '../../worker/push-open'
import { clearPendingOpenSavedAt, readPendingOpen } from '../../worker/push-open-store'
import { readPushOpenMessage } from '../../worker/read-app-notification'

let pendingOpenQueue: Promise<void> = Promise.resolve()

export function PushOpenListener() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let isActive = true
    const retryTimers: number[] = []

    const openPath = (path: string) => {
      if (isSameAppDestination(window.location.href, path, window.location.origin)) return
      navigate(path)
    }

    const enqueue = (task: () => Promise<void>) => {
      pendingOpenQueue = pendingOpenQueue.then(task).catch(() => undefined)
    }

    const consumePending = async (): Promise<void> => {
      const pending = await readPendingOpen(Date.now())
      if (!isActive || !pending) return
      openPath(pending.path)
      await clearPendingOpenSavedAt(pending.savedAt)
    }

    const scheduleConsume = () => {
      enqueue(consumePending)
      for (const timer of retryTimers) window.clearTimeout(timer)
      retryTimers.length = 0
      for (const delay of PENDING_OPEN_RETRY_DELAYS_MS) {
        retryTimers.push(window.setTimeout(() => enqueue(consumePending), delay))
      }
    }

    const handleMessage = (event: MessageEvent) => {
      const path = readPushOpenMessage(event.data)
      if (!path) return
      enqueue(async () => {
        if (!isActive) return
        openPath(path)
        const pending = await readPendingOpen(Date.now())
        if (!isActive || pending?.path !== path) return
        await clearPendingOpenSavedAt(pending.savedAt)
      })
    }

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      scheduleConsume()
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', scheduleConsume)
    if (document.visibilityState === 'visible') scheduleConsume()

    return () => {
      isActive = false
      for (const timer of retryTimers) window.clearTimeout(timer)
      navigator.serviceWorker.removeEventListener('message', handleMessage)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', scheduleConsume)
    }
  }, [navigate])

  return null
}
