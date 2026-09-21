import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@rosti/ui/lib/utils'
import { QuantityStepper, type QuantityTone } from './quantity-stepper'

type ScoreTone = Extract<QuantityTone, 'blue' | 'red'>

interface ScoreSideProps {
  label: string
  labelClassName: string
  value: number
  canEdit: boolean
  onChange?: (value: number) => void
  valueClassName?: string
  className?: string
  tone?: ScoreTone
}

export function ScoreSide({
  label,
  labelClassName,
  value,
  canEdit,
  onChange,
  valueClassName,
  className,
  tone = 'blue',
}: ScoreSideProps) {
  const { t } = useTranslation()
  const inputId = useId()

  return (
    <div className={cn('flex flex-col items-center gap-2 text-center', className)}>
      {canEdit ? (
        <label htmlFor={inputId} className={cn('text-lg font-bold text-white')}>
          {label}
        </label>
      ) : (
        <p className={cn('text-sm font-medium', labelClassName)}>{label}</p>
      )}
      {canEdit ? (
        <QuantityStepper
          id={inputId}
          value={value}
          tone={tone}
          decreaseLabel={t('matches.detail.stats.decreaseScore', { team: label })}
          increaseLabel={t('matches.detail.stats.increaseScore', { team: label })}
          onChange={(next) => onChange?.(next)}
        />
      ) : (
        <p className={cn('text-4xl font-semibold tabular-nums', valueClassName)}>{value}</p>
      )}
    </div>
  )
}
