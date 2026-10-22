import { Button } from '@rosti/ui/components/primitives/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@rosti/ui/components/primitives/sheet'
import { cn } from '@rosti/ui/lib/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBrowserInstallPrompt } from '@/lib/browser-install-prompt'
import { isIosDevice } from '@/features/clubs/utils/is-ios-device'
import { isMobileInstallDevice } from '@/features/clubs/utils/is-mobile-install-device'
import { isInstalledPwa } from '@/lib/web-push'

type InstallPlatform = 'android' | 'ios'

export function HomeInstallLink() {
  const platform = readInstallPlatform()
  if (!platform) return null

  return <HomeInstallOffer platform={platform} />
}

function HomeInstallOffer({ platform }: { platform: InstallPlatform }) {
  const { t } = useTranslation()
  const { canPromptInstall, promptInstall } = useBrowserInstallPrompt()
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [hasAcceptedInstall, setHasAcceptedInstall] = useState(false)
  const platforms: InstallPlatform[] = platform === 'ios' ? ['ios', 'android'] : ['android', 'ios']

  if (hasAcceptedInstall) return null

  const handleOpen = async () => {
    if (!canPromptInstall) {
      setIsTutorialOpen(true)
      return
    }

    try {
      const outcome = await promptInstall()
      if (outcome === 'accepted') {
        setHasAcceptedInstall(true)
        return
      }
      if (outcome === 'unavailable') setIsTutorialOpen(true)
    } catch {
      setIsTutorialOpen(true)
    }
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => void handleOpen()}>
        {t('home.install.link')}
      </Button>
      <Sheet open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] gap-0 overflow-y-auto rounded-t-2xl pb-[max(1.5rem,var(--safe-area-bottom))]"
        >
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border" aria-hidden />
          <SheetHeader className="pr-10">
            <SheetTitle className="text-xl font-black tracking-tight">
              {t('home.install.title')}
            </SheetTitle>
            <SheetDescription>{t('home.install.description')}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4">
            {platforms.map((item) => (
              <InstallPlatformCard key={item} platform={item} isCurrent={item === platform} />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function InstallPlatformCard({
  platform,
  isCurrent,
}: {
  platform: InstallPlatform
  isCurrent: boolean
}) {
  const { t } = useTranslation()
  const copy =
    platform === 'ios'
      ? {
          title: t('home.install.ios.title'),
          steps: [
            t('home.install.ios.steps.open'),
            t('home.install.ios.steps.share'),
            t('home.install.ios.steps.choose'),
            t('home.install.ios.steps.confirm'),
          ],
        }
      : {
          title: t('home.install.android.title'),
          steps: [
            t('home.install.android.steps.open'),
            t('home.install.android.steps.menu'),
            t('home.install.android.steps.choose'),
            t('home.install.android.steps.confirm'),
          ],
        }

  return (
    <section
      className={cn(
        'rounded-xl border p-4',
        isCurrent ? 'border-primary/40 bg-sidebar' : 'bg-background',
      )}
    >
      <h3 className="font-semibold">{copy.title}</h3>
      <ol className="mt-3 flex flex-col gap-3">
        {copy.steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-snug">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
              )}
            >
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function readInstallPlatform(): InstallPlatform | null {
  if (typeof navigator === 'undefined' || isInstalledPwa()) return null

  const input = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  }
  if (!isMobileInstallDevice(input)) return null
  return isIosDevice(input) ? 'ios' : 'android'
}
