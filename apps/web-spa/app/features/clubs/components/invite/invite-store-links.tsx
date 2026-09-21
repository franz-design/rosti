import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL ?? 'https://apps.apple.com'
const PLAY_STORE_URL = import.meta.env.VITE_PLAY_STORE_URL ?? 'https://play.google.com/store'

interface InviteStoreLinksProps {
  invitationId?: string
  email: string | null
  club: string | null
}

export function InviteStoreLinks({ invitationId, email, club }: InviteStoreLinksProps) {
  const { t } = useTranslation()
  const deepLink = `rosti://invite?token=${invitationId ?? ''}&email=${encodeURIComponent(email ?? '')}`

  return (
    <div className="flex flex-col gap-2">
      <a className="underline" href={APP_STORE_URL}>
        {t('invite.appStore')}
      </a>
      <a className="underline" href={PLAY_STORE_URL}>
        {t('invite.playStore')}
      </a>
      <a className="underline" href={deepLink}>
        {t('invite.openApp')}
      </a>
      <Link
        className="underline"
        to={`/register?invitationId=${invitationId ?? ''}&email=${encodeURIComponent(email ?? '')}&club=${encodeURIComponent(club ?? '')}`}
      >
        {t('invite.continueDesktop')}
      </Link>
    </div>
  )
}
