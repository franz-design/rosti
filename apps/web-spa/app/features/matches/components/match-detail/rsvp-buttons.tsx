import { Button } from '@rosti/ui/components/primitives/button'
import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import type { Attendance } from '@/lib/rosti-api'

interface RsvpButtonsProps {
  status?: Attendance['status']
  disabled?: boolean
  direction?: 'row' | 'column'
  onPresent: () => void
  onAbsent: () => void
}

export function RsvpButtons({
  status,
  disabled,
  direction = 'row',
  onPresent,
  onAbsent,
}: RsvpButtonsProps) {
  const { t } = useTranslation()
  const hasAnswered = status === 'present' || status === 'absent'
  const isColumn = direction === 'column'

  return (
    <div
      className={cn(
        'flex gap-2 w-full lg:max-w-64 lg:max-w-100',
        isColumn ? 'w-36 flex-col' : 'flex-wrap',
      )}
    >
      <Button
        type="button"
        variant={status === 'present' ? 'default' : 'outline'}
        className={cn(
          isColumn ? 'w-full' : 'min-w-36 flex-1',
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
          isColumn ? 'w-full' : 'min-w-36 flex-1',
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
