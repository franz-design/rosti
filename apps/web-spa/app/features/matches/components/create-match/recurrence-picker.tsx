import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import {
  getNthWeekdayLabel,
  type RecurrenceChoice,
} from '@/features/matches/utils/match-schedule-utils'

interface RecurrencePickerProps {
  value: RecurrenceChoice
  onChange: (value: RecurrenceChoice) => void
  matchDate?: Date
  weekdayName: string
  dayOfMonth: number
}

export function RecurrencePicker({
  value,
  onChange,
  matchDate,
  weekdayName,
  dayOfMonth,
}: RecurrencePickerProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant={value === 'once' ? 'default' : 'outline'}
          className="justify-start h-auto py-3"
          onClick={() => onChange('once')}
        >
          {t('createMatch.once')}
        </Button>
        <Button
          type="button"
          variant={value === 'weekly' ? 'default' : 'outline'}
          className="justify-start h-auto py-3"
          onClick={() => onChange('weekly')}
        >
          {t('createMatch.everyWeek', { day: weekdayName })}
        </Button>
        <Button
          type="button"
          variant={value === 'monthly_nth_weekday' ? 'default' : 'outline'}
          className="justify-start h-auto py-3"
          onClick={() => onChange('monthly_nth_weekday')}
        >
          {matchDate
            ? getNthWeekdayLabel(matchDate, t, 'createMatch')
            : t('createMatch.monthlyNthFallback')}
        </Button>
        <Button
          type="button"
          variant={value === 'monthly' ? 'default' : 'outline'}
          className="justify-start h-auto py-3"
          onClick={() => onChange('monthly')}
        >
          {t('createMatch.everyMonthDate', { day: dayOfMonth })}
        </Button>
      </div>
      {value !== 'once' ? (
        <p className="text-xs text-muted-foreground">{t('createMatch.recurrenceHint')}</p>
      ) : null}
    </div>
  )
}
