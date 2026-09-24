import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { EmailPillsInput } from '@/features/onboarding/components/email-pills-input'

interface InviteMembersSectionProps {
  emails: string[]
  onEmailsChange: (emails: string[]) => void
  onSubmit: () => void
  isPending: boolean
}

export function InviteMembersSection({
  emails,
  onEmailsChange,
  onSubmit,
  isPending,
}: InviteMembersSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-medium">{t('clubSettings.invite.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('clubSettings.invite.hint')}</p>
      <EmailPillsInput
        emails={emails}
        onChange={onEmailsChange}
        placeholder={t('clubSettings.invite.placeholder')}
      />
      <Button disabled={isPending || emails.length === 0} loading={isPending} onClick={onSubmit}>
        {t('clubSettings.invite.send')}
      </Button>
    </section>
  )
}
