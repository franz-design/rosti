import { useCallback, useEffect, useState } from 'react'
import { isMobileInstallDevice } from '@/features/clubs/utils/is-mobile-install-device'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallPromptOutcome = 'accepted' | 'dismissed' | 'unavailable'

interface BrowserInstallPrompt {
  canPromptInstall: boolean
  promptInstall: () => Promise<InstallPromptOutcome>
}

let storedPrompt: BeforeInstallPromptEvent | null = null
let isListening = false
const subscribers = new Set<(event: BeforeInstallPromptEvent | null) => void>()

function publishPrompt(event: BeforeInstallPromptEvent | null) {
  storedPrompt = event
  for (const subscriber of subscribers) subscriber(event)
}

export function captureBrowserInstallPrompt(): void {
  if (isListening || typeof window === 'undefined') return
  isListening = true

  window.addEventListener('beforeinstallprompt', (event) => {
    const input = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
    }
    if (!isMobileInstallDevice(input)) return

    event.preventDefault()
    publishPrompt(event as BeforeInstallPromptEvent)
  })
}

export function useBrowserInstallPrompt(): BrowserInstallPrompt {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(storedPrompt)

  useEffect(() => {
    captureBrowserInstallPrompt()
    subscribers.add(setPromptEvent)
    setPromptEvent(storedPrompt)
    return () => {
      subscribers.delete(setPromptEvent)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<InstallPromptOutcome> => {
    if (!storedPrompt) return 'unavailable'

    try {
      await storedPrompt.prompt()
      const choice = await storedPrompt.userChoice
      return choice.outcome
    } finally {
      publishPrompt(null)
    }
  }, [])

  return {
    canPromptInstall: promptEvent !== null,
    promptInstall,
  }
}
