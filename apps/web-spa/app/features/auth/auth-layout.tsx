import { AppToaster } from '@/common/components/app-toaster'
import { useScrollToTop } from '@/common/hooks/use-scroll-to-top'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useSearchParams } from 'react-router'
import { AuthBrand } from './components/auth-brand'
import { AuthPhotoPanel } from './components/auth-photo-panel'

const MARKETING_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/onboarding',
])

export default function AuthLayout() {
  const { pathname } = useLocation()

  return (
    <>
      {MARKETING_PATHS.has(pathname) ? <MarketingAuthShell /> : <PlainAuthShell />}
      <AppToaster />
    </>
  )
}

function MarketingAuthShell() {
  const scrollRef = useScrollToTop<HTMLElement>()
  const photo = useMarketingPhoto()

  return (
    <div className="flex min-h-svh flex-col min-[1100px]:h-svh min-[1100px]:flex-row-reverse min-[1100px]:overflow-hidden">
      <AuthPhotoPanel
        headline={photo.headline}
        sentence={photo.sentence}
        showSports={photo.showSports}
      />
      <main
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col items-center px-6 pt-8 pb-12 md:min-w-lg min-[1100px]:flex-none min-[1100px]:overflow-y-auto min-[1100px]:px-8 min-[1100px]:py-8"
      >
        <AuthBrand />
        <div className="flex w-full max-w-lg flex-1 flex-col">
          <div className="flex flex-1 items-center pt-10 min-[1100px]:pt-8">
            <div className="w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function PlainAuthShell() {
  const scrollRef = useScrollToTop<HTMLDivElement>()

  return (
    <div ref={scrollRef} className="flex h-svh flex-col overflow-y-auto px-6 py-8">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-12">
        <AuthBrand />
        <div className="flex flex-1 items-center">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

function useMarketingPhoto(): { headline: string; sentence: string; showSports: boolean } {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const club = searchParams.get('club')
  const invitationId = searchParams.get('invitationId') ?? searchParams.get('invite')
  const isInvite = Boolean(club || invitationId)

  if (isInvite) {
    return {
      headline: club
        ? t('auth.photo.inviteHeadline', { club })
        : t('auth.photo.inviteHeadlineFallback'),
      sentence: t('auth.photo.inviteSentence'),
      showSports: false,
    }
  }

  if (pathname === '/register' || pathname === '/onboarding') {
    return {
      headline: t('auth.photo.createHeadline'),
      sentence: t('auth.photo.createSentence'),
      showSports: pathname === '/register',
    }
  }

  return {
    headline: t('auth.photo.loginHeadline'),
    sentence: t('auth.photo.loginSentence'),
    showSports: pathname === '/login',
  }
}
