import { Button } from '@rosti/ui/components/primitives/button'
import { Label } from '@rosti/ui/components/primitives/label'
import { useTranslation } from 'react-i18next'
import { EmailPillsInput } from '../email-pills-input'

interface InvitesStepProps {
  emails: string[]
  isPending: boolean
  onEmailsChange: (emails: string[]) => void
  onSend: () => void
  onSkip: () => void
  onBack: () => void
}

export function InvitesStep({
  emails,
  isPending,
  onEmailsChange,
  onSend,
  onSkip,
  onBack,
}: InvitesStepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('onboarding.step4.emails')}</Label>
        <p className="text-sm text-muted-foreground">{t('onboarding.step4.emailsHint')}</p>
        <EmailPillsInput
          emails={emails}
          onChange={onEmailsChange}
          placeholder={t('onboarding.step4.emailsPlaceholder')}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={isPending || emails.length === 0}
          loading={isPending}
          onClick={onSend}
        >
          {t('onboarding.step4.sendInvites')}
        </Button>
        <Button variant="ghost" className="w-full" disabled={isPending} onClick={onSkip}>
          {t('onboarding.step4.skip')}
        </Button>
        <Button variant="outline" disabled={isPending} onClick={onBack}>
          {t('onboarding.back')}
        </Button>
      </div>
    </div>
  )
}
