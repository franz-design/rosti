import { Button } from '@rosti/ui/components/primitives/button'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { rostiApi } from '@/lib/rosti-api'
import {
  enableWebPushOnThisBrowser,
  readBrowserPushState,
  readConfiguredWebPushPublicKey,
  shouldExplainIosHomeScreen,
  type BrowserPushState,
} from '@/lib/web-push'

interface PushDeviceStatusProps {
  pushEnabled: boolean
  enableRef: RefObject<(() => void) | null>
}

export function PushDeviceStatus({ pushEnabled, enableRef }: PushDeviceStatusProps) {
  const { t } = useTranslation()
  const [browserState, setBrowserState] = useState<BrowserPushState | 'loading'>('loading')
  const [isEnabling, setIsEnabling] = useState(false)
  const { data: keyData, isLoading: isKeyLoading } = useQuery({
    queryKey: ['web-push-public-key'],
    queryFn: () => rostiApi.getWebPushPublicKey(),
  })
  const publicKey = keyData?.publicKey || readConfiguredWebPushPublicKey()

  const activate = useCallback(
    async (key: string): Promise<void> => {
      setIsEnabling(true)
      const next = await enableWebPushOnThisBrowser(key)
      setBrowserState(next)
      setIsEnabling(false)
      if (next === 'failed') toast.error(t('profile.notifications.pushStatusFailed'))
    },
    [t],
  )

  useEffect(() => {
    enableRef.current = () => {
      if (!publicKey) return
      void activate(publicKey)
    }
    return () => {
      enableRef.current = null
    }
  }, [activate, enableRef, publicKey])

  useEffect(() => {
    if (!pushEnabled) {
      setBrowserState('not-asked')
      return
    }
    if (isKeyLoading || !publicKey) return

    let cancelled = false
    const refresh = async (): Promise<void> => {
      const next = await readBrowserPushState()
      if (cancelled) return
      if (next === 'allowed') {
        const synced = await enableWebPushOnThisBrowser(publicKey)
        if (!cancelled) setBrowserState(synced)
        return
      }
      setBrowserState(next)
    }
    void refresh()
    return () => {
      cancelled = true
    }
  }, [isKeyLoading, publicKey, pushEnabled])

  const statusKey = resolveStatusKey({
    pushEnabled,
    isKeyLoading,
    hasPublicKey: !!publicKey,
    browserState,
  })
  const canEnable =
    pushEnabled &&
    !!publicKey &&
    !isEnabling &&
    (browserState === 'not-asked' || browserState === 'failed')

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t(statusKey)}</p>
      {shouldExplainIosHomeScreen() ? (
        <p className="text-sm text-muted-foreground">{t('profile.notifications.iosHint')}</p>
      ) : null}
      {canEnable ? (
        <Button
          size="sm"
          disabled={isEnabling}
          onClick={() => {
            if (!publicKey) return
            void activate(publicKey)
          }}
        >
          {isEnabling
            ? t('profile.notifications.enablingOnThisDevice')
            : t('profile.notifications.enableOnThisDevice')}
        </Button>
      ) : null}
    </div>
  )
}

function resolveStatusKey(input: {
  pushEnabled: boolean
  isKeyLoading: boolean
  hasPublicKey: boolean
  browserState: BrowserPushState | 'loading'
}): `profile.notifications.${string}` {
  if (!input.pushEnabled) return 'profile.notifications.pushStatusOff'
  if (input.isKeyLoading || input.browserState === 'loading') {
    return 'profile.notifications.pushStatusLoading'
  }
  if (!input.hasPublicKey) return 'profile.notifications.pushStatusNoKey'
  if (input.browserState === 'unsupported') return 'profile.notifications.pushStatusUnsupported'
  if (input.browserState === 'no-worker') return 'profile.notifications.pushStatusNoWorker'
  if (input.browserState === 'blocked') return 'profile.notifications.pushStatusBlocked'
  if (input.browserState === 'allowed') return 'profile.notifications.pushStatusAllowed'
  if (input.browserState === 'failed') return 'profile.notifications.pushStatusFailed'
  return 'profile.notifications.pushStatusNotAsked'
}
