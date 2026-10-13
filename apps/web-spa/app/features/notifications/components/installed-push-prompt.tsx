import { Button } from '@rosti/ui/components/primitives/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@rosti/ui/components/primitives/dialog'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authClient } from '@/lib/auth-client'
import { rostiApi } from '@/lib/rosti-api'
import {
  enableWebPushOnThisBrowser,
  isInstalledPwa,
  readBrowserPushState,
  readConfiguredWebPushPublicKey,
  waitForInstalledPushRegistration,
} from '@/lib/web-push'
import {
  readPushPromptDismissedAt,
  rememberPushPromptDismissed,
  shouldShowInstalledPushPrompt,
} from '../utils/installed-push-prompt'

export function InstalledPushPrompt() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id
  const installed = isInstalledPwa()
  const [open, setOpen] = useState(false)
  const [isEnabling, setIsEnabling] = useState(false)
  const { data: keyData } = useQuery({
    queryKey: ['web-push-public-key'],
    queryFn: () => rostiApi.getWebPushPublicKey(),
    enabled: installed && !!userId,
  })
  const publicKey = keyData?.publicKey || readConfiguredWebPushPublicKey()

  useEffect(() => {
    if (!installed || !userId || !publicKey) return
    let cancelled = false

    const check = async (): Promise<void> => {
      const registration = await waitForInstalledPushRegistration()
      if (cancelled || !registration) return
      const browserState = await readBrowserPushState()
      if (cancelled) return
      const visible = shouldShowInstalledPushPrompt({
        isInstalled: true,
        browserState,
        dismissedAt: readPushPromptDismissedAt(userId),
        now: Date.now(),
        hasPublicKey: true,
      })
      if (visible) setOpen(true)
    }

    void check()
    return () => {
      cancelled = true
    }
  }, [installed, publicKey, userId])

  const handleLater = (): void => {
    if (!userId || isEnabling) return
    rememberPushPromptDismissed(userId)
    setOpen(false)
  }

  const handleEnable = (): void => {
    if (!publicKey || !userId || isEnabling) return
    setIsEnabling(true)
    void enableWebPushOnThisBrowser(publicKey)
      .then(async (next) => {
        if (next === 'allowed') {
          try {
            await rostiApi.updateNotificationPreferences({ pushEnabled: true })
            void queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
            toast.success(t('pushPrompt.enabled'))
          } catch {
            toast.error(t('pushPrompt.failed'))
          }
          setIsEnabling(false)
          setOpen(false)
          return
        }

        setIsEnabling(false)
        if (next === 'failed') {
          toast.error(t('pushPrompt.failed'))
          return
        }
        if (next === 'not-asked') rememberPushPromptDismissed(userId)
        setOpen(false)
      })
      .catch(() => {
        setIsEnabling(false)
        toast.error(t('pushPrompt.failed'))
      })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return
        handleLater()
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('pushPrompt.title')}</DialogTitle>
          <DialogDescription>{t('pushPrompt.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={isEnabling} onClick={handleLater}>
            {t('pushPrompt.later')}
          </Button>
          <Button disabled={isEnabling} onClick={handleEnable}>
            {isEnabling ? t('pushPrompt.enabling') : t('pushPrompt.enable')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
