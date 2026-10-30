import { useTranslation } from 'react-i18next'
import { StepProgress } from '@/common/components/step-progress'

const STEPS = ['club', 'sport'] as const

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
      <StepProgress
        steps={STEPS}
        step={step}
        ariaLabel={t('onboarding.stepsLabel')}
        labelFor={(id) => t(`onboarding.steps.${id}`)}
        isStepEnabled={isStepEnabled}
        isLocked={isLocked}
        onStepSelect={onStepSelect}
      />
    </div>
  )
}
