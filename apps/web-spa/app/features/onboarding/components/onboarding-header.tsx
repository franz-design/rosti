import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'

interface OnboardingHeaderProps {
  step: number
  total: number
}

export function OnboardingHeader({ step, total }: OnboardingHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2 text-center">
      <p className="font-logo text-lg font-bold tracking-tight text-foreground">Rösti</p>
      <h1 className="text-2xl font-black tracking-tight">{t('onboarding.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('onboarding.stepOf', { current: step, total })}
      </p>
      <div className="flex justify-center gap-2 pt-2">
        {Array.from({ length: total }, (_, index) => index + 1).map((n) => (
          <div
            key={n}
            className={cn('h-1.5 w-10 rounded-full', n <= step ? 'bg-primary' : 'bg-muted')}
          />
        ))}
      </div>
    </div>
  )
}
