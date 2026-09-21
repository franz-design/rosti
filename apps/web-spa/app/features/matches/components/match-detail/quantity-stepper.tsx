import { Minus, Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { cn } from '@rosti/ui/lib/utils'

const MAX_VALUE = 999

export type QuantityTone = 'blue' | 'red' | 'neutral'
export type QuantitySize = 'md' | 'sm'

const TONE_CLASS: Record<QuantityTone, { frame: string; divider: string; symbol: string }> = {
  blue: {
    frame:
      'border-team-blue focus-within:border-team-blue focus-within:ring-3 focus-within:ring-team-blue/40',
    divider: 'border-team-blue',
    symbol: 'text-team-blue',
  },
  red: {
    frame:
      'border-primary focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/40',
    divider: 'border-primary',
    symbol: 'text-primary',
  },
  neutral: {
    frame:
      'border-neutral-300 focus-within:border-neutral-400 focus-within:ring-3 focus-within:ring-neutral-400/30',
    divider: 'border-neutral-300',
    symbol: 'text-neutral-950',
  },
}

const SIZE_CLASS: Record<QuantitySize, { frame: string; button: string; icon: string; input: string }> = {
  md: {
    frame: 'h-14 rounded-2xl',
    button: 'w-12',
    icon: 'size-5',
    input: 'w-16 text-2xl',
  },
  sm: {
    frame: 'h-10 w-[6.75rem] rounded-xl',
    button: 'w-8',
    icon: 'size-4',
    input: 'min-w-0 flex-1 text-base',
  },
}

interface QuantityStepperProps {
  id?: string
  value: number
  onChange: (value: number) => void
  decreaseLabel: string
  increaseLabel: string
  tone?: QuantityTone
  size?: QuantitySize
}

export function QuantityStepper({
  id,
  value,
  onChange,
  decreaseLabel,
  increaseLabel,
  tone = 'neutral',
  size = 'md',
}: QuantityStepperProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [isBlank, setIsBlank] = useState(false)
  const toneClass = TONE_CLASS[tone]
  const sizeClass = SIZE_CLASS[size]

  function commit(next: number) {
    const safe = Math.min(MAX_VALUE, Math.max(0, Math.trunc(next)))
    setIsBlank(false)
    onChange(safe)
  }

  function handleInput(raw: string) {
    if (raw === '') {
      setIsBlank(true)
      onChange(0)
      return
    }

    if (!/^\d{1,3}$/.test(raw)) return

    setIsBlank(false)
    onChange(Number(raw))
  }

  return (
    <div
      className={cn(
        'inline-flex items-stretch overflow-hidden border bg-white',
        sizeClass.frame,
        toneClass.frame,
      )}
    >
      <button
        type="button"
        className={cn(
          'flex cursor-pointer items-center justify-center transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40',
          sizeClass.button,
          toneClass.symbol,
        )}
        aria-label={decreaseLabel}
        disabled={value <= 0}
        onClick={() => commit(value - 1)}
      >
        <Minus className={sizeClass.icon} strokeWidth={2.5} />
      </button>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]*"
        value={isBlank ? '' : value}
        onChange={(event) => handleInput(event.target.value)}
        onBlur={() => setIsBlank(false)}
        onFocus={(event) => event.currentTarget.select()}
        onMouseUp={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            commit(value + 1)
            return
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault()
            commit(value - 1)
            return
          }

          if (
            event.key === 'e' ||
            event.key === 'E' ||
            event.key === '+' ||
            event.key === '-' ||
            event.key === '.'
          ) {
            event.preventDefault()
          }
        }}
        className={cn(
          'border-x bg-transparent text-center font-bold tabular-nums outline-none',
          sizeClass.input,
          toneClass.divider,
          toneClass.symbol,
        )}
      />
      <button
        type="button"
        className={cn(
          'flex cursor-pointer items-center justify-center transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40',
          sizeClass.button,
          toneClass.symbol,
        )}
        aria-label={increaseLabel}
        disabled={value >= MAX_VALUE}
        onClick={() => commit(value + 1)}
      >
        <Plus className={sizeClass.icon} strokeWidth={2.5} />
      </button>
    </div>
  )
}
