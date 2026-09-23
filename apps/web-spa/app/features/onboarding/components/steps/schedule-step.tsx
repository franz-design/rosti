import { Button } from '@rosti/ui/components/primitives/button'
import { DatePicker } from '@rosti/ui/components/primitives/date-picker'
import { Label } from '@rosti/ui/components/primitives/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rosti/ui/components/primitives/select'
import { useTranslation } from 'react-i18next'
import {
  TIME_OPTIONS,
  getNthWeekdayLabel,
  type RecurrenceChoice,
} from '@/features/matches/utils/match-schedule-utils'

type OnboardingRecurrence = Exclude<RecurrenceChoice, 'once'>

interface ScheduleStepProps {
  seasonStartsAt: Date
  seasonEndsAt: Date
  matchDate: Date | undefined
  matchTime: string
  recurrence: OnboardingRecurrence
  weekdayName: string
  dayOfMonth: number
  isPending: boolean
  onSeasonStartsAtChange: (value: Date | undefined) => void
  onSeasonEndsAtChange: (value: Date | undefined) => void
  onDateChange: (value: Date | undefined) => void
  onTimeChange: (value: string) => void
  onRecurrenceChange: (value: OnboardingRecurrence) => void
  onBack: () => void
  onNext: () => void
}

export function ScheduleStep({
  seasonStartsAt,
  seasonEndsAt,
  matchDate,
  matchTime,
  recurrence,
  weekdayName,
  dayOfMonth,
  isPending,
  onSeasonStartsAtChange,
  onSeasonEndsAtChange,
  onDateChange,
  onTimeChange,
  onRecurrenceChange,
  onBack,
  onNext,
}: ScheduleStepProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('onboarding.step3.seasonStartsAt')}</Label>
        <DatePicker
          value={seasonStartsAt}
          onDateChange={onSeasonStartsAtChange}
          localeCode="fr-FR"
          placeholder={t('onboarding.step3.datePlaceholder')}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('onboarding.step3.seasonEndsAt')}</Label>
        <DatePicker
          value={seasonEndsAt}
          onDateChange={onSeasonEndsAtChange}
          localeCode="fr-FR"
          placeholder={t('onboarding.step3.datePlaceholder')}
        />
        <p className="text-xs text-muted-foreground">{t('onboarding.step3.seasonHint')}</p>
      </div>
      <div className="space-y-2">
        <Label>{t('onboarding.step3.date')}</Label>
        <DatePicker
          value={matchDate}
          onDateChange={onDateChange}
          localeCode="fr-FR"
          placeholder={t('onboarding.step3.datePlaceholder')}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('onboarding.step3.time')}</Label>
        <Select value={matchTime} onValueChange={(v) => v && onTimeChange(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('onboarding.step3.recurrence')}</Label>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={recurrence === 'weekly' ? 'default' : 'outline'}
            className="justify-start h-auto py-3"
            onClick={() => onRecurrenceChange('weekly')}
          >
            {t('onboarding.step3.everyWeek', { day: weekdayName })}
          </Button>
          <Button
            type="button"
            variant={recurrence === 'monthly_nth_weekday' ? 'default' : 'outline'}
            className="justify-start h-auto py-3"
            onClick={() => onRecurrenceChange('monthly_nth_weekday')}
          >
            {matchDate
              ? getNthWeekdayLabel(matchDate, t, 'onboarding.step3')
              : t('onboarding.step3.monthlyNthFallback')}
          </Button>
          <Button
            type="button"
            variant={recurrence === 'monthly' ? 'default' : 'outline'}
            className="justify-start h-auto py-3"
            onClick={() => onRecurrenceChange('monthly')}
          >
            {t('onboarding.step3.everyMonthDate', { day: dayOfMonth })}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('onboarding.step3.recurrenceHint')}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          {t('onboarding.back')}
        </Button>
        <Button className="flex-1" disabled={isPending || !matchDate} onClick={onNext}>
          {t('onboarding.next')}
        </Button>
      </div>
    </div>
  )
}
