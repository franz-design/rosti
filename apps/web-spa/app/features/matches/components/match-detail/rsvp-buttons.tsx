import { Button } from '@rosti/ui/components/primitives/button'
import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import type { Attendance } from '@/lib/rosti-api'

interface RsvpButtonsProps {
  status?: Attendance['status']
  disabled?: boolean
  onPresent: () => void
  onAbsent: () => void
}

export function RsvpButtons({ status, disabled, onPresent, onAbsent }: RsvpButtonsProps) {
  const { t } = useTranslation()
  const hasAnswered = status === 'present' || status === 'absent'

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={status === 'present' ? 'default' : 'outline'}
        className={cn(
          'min-w-36',
          hasAnswered && status !== 'present' && 'opacity-40 hover:opacity-70',
        )}
        disabled={disabled}
        onClick={onPresent}
      >
        {t('matches.detail.rsvp.present')}
      </Button>
      <Button
        type="button"
        variant={status === 'absent' ? 'default' : 'outline'}
        className={cn(
          'min-w-36',
          hasAnswered && status !== 'absent' && 'opacity-40 hover:opacity-70',
        )}
        disabled={disabled}
        onClick={onAbsent}
      >
        {t('matches.detail.rsvp.absent')}
      </Button>
    </div>
  )
}
