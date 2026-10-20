import { useTranslation } from 'react-i18next'

interface AuthInvitePillProps {
  club: string | null
}

export function AuthInvitePill({ club }: AuthInvitePillProps) {
  const { t } = useTranslation()

  return (
    <p className="mb-5 inline-flex h-7 items-center rounded-full border border-foreground/20 bg-foreground/[0.06] px-3 text-xs font-medium text-foreground">
      {club ? t('auth.invitePill', { club }) : t('auth.invitePillFallback')}
    </p>
  )
}
