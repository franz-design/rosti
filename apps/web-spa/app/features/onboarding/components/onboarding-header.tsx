import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'

const STEPS = ['club', 'sport', 'schedule', 'invites'] as const

interface OnboardingHeaderProps {
  step: number
  isStepEnabled: (step: number) => boolean
  isLocked: boolean
  onStepSelect: (step: number) => void
}

export function OnboardingHeader({
  step,
  isStepEnabled,
  isLocked,
  onStepSelect,
}: OnboardingHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight">{t('onboarding.title')}</h1>
      <nav aria-label={t('onboarding.stepsLabel')}>
        <ol className="flex gap-2">
          {STEPS.map((id, index) => {
            const stepNumber = index + 1
            const isCurrent = stepNumber === step
            const isEnabled = isStepEnabled(stepNumber)
            return (
              <li key={id} className="min-w-0 flex-1">
                <button
                  type="button"
                  disabled={!isEnabled || isLocked}
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={() => onStepSelect(stepNumber)}
                  className="group flex w-full cursor-pointer flex-col items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                >
                  <span
                    className={cn(
                      'w-full truncate text-center text-sm transition-colors font-semibold',
                      isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground/50 ',
                      isEnabled && 'text-foreground group-hover:text-foreground',
                      !isEnabled && 'opacity-40',
                    )}
                  >
                    {t(`onboarding.steps.${id}`)}
                  </span>
                  <span
                    className={cn(
                      'h-1.5 w-full rounded-full transition-colors',
                      stepNumber <= step ? 'bg-primary' : 'bg-muted group-hover:bg-primary',
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
