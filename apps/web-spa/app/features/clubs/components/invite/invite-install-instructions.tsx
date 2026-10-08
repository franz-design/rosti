import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useBrowserInstallPrompt } from '@/features/clubs/hooks/use-browser-install-prompt'
import { isIosDevice } from '@/features/clubs/utils/is-ios-device'

interface InviteInstallInstructionsProps {
  invitationId?: string
  email: string | null
  club: string | null
}

export function InviteInstallInstructions({
  invitationId,
  email,
  club,
}: InviteInstallInstructionsProps) {
  const { t } = useTranslation()
  const { canPromptInstall, promptInstall } = useBrowserInstallPrompt()
  const showIosSteps = isIosDevice({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  })
  const registerParams = new URLSearchParams()
  if (email) registerParams.set('email', email)
  if (club) registerParams.set('club', club)
  if (invitationId) registerParams.set('invitationId', invitationId)

  return (
    <div className="flex flex-col gap-4 text-left">
      {showIosSteps ? (
        <IosInstallSteps />
      ) : (
        <BrowserInstallPrompt
          canPromptInstall={canPromptInstall}
          onInstall={() => void promptInstall()}
        />
      )}
      <Link className="text-center text-sm underline" to={`/register?${registerParams.toString()}`}>
        {t('invite.continueBrowser')}
      </Link>
    </div>
  )
}

function IosInstallSteps() {
  const { t } = useTranslation()

  return (
    <div className="space-y-2 text-sm">
      <p>{t('invite.install.iosTitle')}</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>{t('invite.install.iosShare')}</li>
        <li>{t('invite.install.iosAdd')}</li>
      </ol>
    </div>
  )
}

function BrowserInstallPrompt({
  canPromptInstall,
  onInstall,
}: {
  canPromptInstall: boolean
  onInstall: () => void
}) {
  const { t } = useTranslation()

  if (!canPromptInstall) {
    return <p className="text-sm">{t('invite.install.browserMenu')}</p>
  }

  return (
    <Button type="button" className="w-full" onClick={onInstall}>
      {t('invite.install.button')}
    </Button>
  )
}
