import { Button } from '@rosti/ui/components/primitives/button'
import { Input } from '@rosti/ui/components/primitives/input'
import { Label } from '@rosti/ui/components/primitives/label'
import { useTranslation } from 'react-i18next'

interface ClubStepProps {
  clubName: string
  venue: string
  nameError: string | null
  isPending: boolean
  onClubNameChange: (value: string) => void
  onVenueChange: (value: string) => void
  onNext: () => void
}

export function ClubStep({
  clubName,
  venue,
  nameError,
  isPending,
  onClubNameChange,
  onVenueChange,
  onNext,
}: ClubStepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clubName">{t('onboarding.step1.clubName')}</Label>
        <Input
          id="clubName"
          value={clubName}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? 'club-name-error' : undefined}
          onChange={(e) => onClubNameChange(e.target.value)}
          placeholder={t('onboarding.step1.clubNamePlaceholder')}
        />
        {nameError ? (
          <p id="club-name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="venue">{t('onboarding.step1.venue')}</Label>
        <Input
          id="venue"
          value={venue}
          onChange={(e) => onVenueChange(e.target.value)}
          placeholder={t('onboarding.step1.venuePlaceholder')}
        />
      </div>
      <Button
        className="w-full"
        disabled={isPending || !clubName.trim() || !venue.trim()}
        loading={isPending}
        onClick={onNext}
      >
        {t('onboarding.next')}
      </Button>
    </div>
  )
}
