import { Button } from '@rosti/ui/components/primitives/button'
import { Input } from '@rosti/ui/components/primitives/input'
import { Label } from '@rosti/ui/components/primitives/label'
import { useTranslation } from 'react-i18next'
import type { SportType } from '@/lib/rosti-api'
import { SportPicker } from './sport-picker'

interface SportStepProps {
  sportType: SportType
  maxPlayers: number
  isPending: boolean
  onSportChange: (value: SportType) => void
  onMaxPlayersChange: (value: number) => void
  onBack: () => void
  onNext: () => void
}

export function SportStep({
  sportType,
  maxPlayers,
  isPending,
  onSportChange,
  onMaxPlayersChange,
  onBack,
  onNext,
}: SportStepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('onboarding.step2.sport')}</Label>
        <SportPicker value={sportType} onChange={onSportChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxPlayers">{t('onboarding.step2.maxPlayers')}</Label>
        <Input
          id="maxPlayers"
          type="number"
          min={2}
          max={40}
          value={maxPlayers}
          onChange={(e) => onMaxPlayersChange(Number(e.target.value) || 0)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          {t('onboarding.back')}
        </Button>
        <Button className="flex-1" disabled={isPending || maxPlayers < 2} onClick={onNext}>
          {t('onboarding.next')}
        </Button>
      </div>
    </div>
  )
}
