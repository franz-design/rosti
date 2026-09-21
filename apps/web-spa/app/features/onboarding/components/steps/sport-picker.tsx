import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import type { SportType } from '@/lib/rosti-api'

const SPORTS: SportType[] = [
  'football',
  'futsal',
  'basketball',
  'volleyball',
  'tennis',
  'padel',
  'badminton',
  'other',
]

interface SportPickerProps {
  value: SportType
  onChange: (value: SportType) => void
}

export function SportPicker({ value, onChange }: SportPickerProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SPORTS.map((sport) => (
        <Button
          key={sport}
          type="button"
          variant={value === sport ? 'default' : 'outline'}
          className="h-auto py-3"
          onClick={() => onChange(sport)}
        >
          {t(`onboarding.sports.${sport}`)}
        </Button>
      ))}
    </div>
  )
}
