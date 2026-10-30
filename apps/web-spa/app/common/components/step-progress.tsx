import { cn } from '@rosti/ui/lib/utils'

interface StepProgressProps {
  steps: readonly string[]
  step: number
  ariaLabel: string
  labelFor: (id: string) => string
  isStepEnabled: (step: number) => boolean
  isLocked: boolean
  onStepSelect: (step: number) => void
}

export function StepProgress({
  steps,
  step,
  ariaLabel,
  labelFor,
  isStepEnabled,
  isLocked,
  onStepSelect,
}: StepProgressProps) {
  return (
    <nav aria-label={ariaLabel}>
      <ol className="flex gap-2">
        {steps.map((id, index) => {
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
                    'w-full truncate text-center text-sm font-semibold transition-colors',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground/50',
                    isEnabled && 'text-foreground group-hover:text-foreground',
                    !isEnabled && 'opacity-40',
                  )}
                >
                  {labelFor(id)}
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
  )
}
