import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { cn } from '@rosti/ui/lib/utils'

const MAX_LABELED_TICKS = 20

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: SliderPrimitive.Root.Props<number>) {
  const ticks = labeledTicks(min, max, step)

  return (
    <SliderPrimitive.Root
      thumbAlignment="edge"
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      className={cn(
        'group/slider w-full [--slider-thumb-width:2.75rem] aria-disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control className="flex w-full touch-none items-center py-1 select-none">
        <SliderPrimitive.Track className="relative h-4 w-full grow rounded-full bg-[#f4efe9] dark:bg-muted">
          <SliderPrimitive.Indicator className="rounded-full bg-primary" />
          <SliderPrimitive.Thumb className="flex h-5.5 w-[var(--slider-thumb-width)] cursor-grab items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(40,24,16,0.08),0_4px_12px_rgba(40,24,16,0.14)] ring-1 ring-black/5 outline-none select-none group-aria-disabled/slider:cursor-default focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing">
            <span className="pointer-events-none flex items-center gap-[3px]" aria-hidden="true">
              <span className="h-2 w-px rounded-full bg-black/15" />
              <span className="h-2.5 w-px rounded-full bg-black/15" />
              <span className="h-2 w-px rounded-full bg-black/15" />
            </span>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
      {ticks.length > 0 ? <SliderScale ticks={ticks} /> : null}
    </SliderPrimitive.Root>
  )
}

function SliderScale({ ticks }: { ticks: number[] }) {
  const lastIndex = ticks.length - 1

  return (
    <div className="relative mt-1.5 h-7 select-none" aria-hidden="true">
      {ticks.map((tick, index) => (
        <span
          key={tick}
          className="absolute flex -translate-x-1/2 flex-col items-center gap-1"
          style={{
            left: `calc(var(--slider-thumb-width) / 2 + (100% - var(--slider-thumb-width)) * ${index / lastIndex})`,
          }}
        >
          <span className="h-1.5 w-px bg-foreground/25" />
          <span className="text-xs leading-none tabular-nums text-muted-foreground">{tick}</span>
        </span>
      ))}
    </div>
  )
}

function labeledTicks(min: number, max: number, step: number): number[] {
  if (!(step > 0) || !(max > min)) return []
  const count = Math.round((max - min) / step)
  if (count < 1 || count > MAX_LABELED_TICKS) return []
  return Array.from({ length: count + 1 }, (_, index) => roundTick(min + index * step))
}

function roundTick(value: number): number {
  return Math.round(value * 1000) / 1000
}

export { Slider }
