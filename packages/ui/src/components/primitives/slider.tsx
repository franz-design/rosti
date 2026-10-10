import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { cn } from '@rosti/ui/lib/utils'

function Slider({
  className,
  children,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props<number>) {
  return (
    <SliderPrimitive.Root
      thumbAlignment="edge"
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn('group/slider w-full aria-disabled:opacity-60', className)}
      {...props}
    >
      <SliderPrimitive.Control className="flex w-full touch-none items-center py-4 select-none">
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-secondary">
          <SliderPrimitive.Indicator className="rounded-full bg-primary" />
          <SliderPrimitive.Thumb className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm ring-2 ring-background outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 group-aria-disabled/slider:cursor-default cursor-grab active:cursor-grabbing">
            <span className="pointer-events-none tabular-nums">{children}</span>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
