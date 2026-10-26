import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, useReducedMotion, type Transition } from 'motion/react'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react'

import { cn } from '@rosti/ui/lib/utils'

const SLIDE_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 36,
  mass: 0.7,
}

const INSTANT_TRANSITION: Transition = { duration: 0 }

const LINE_THICKNESS_PX = 2
const LINE_OFFSET_PX = 5

function Tabs({ className, orientation = 'horizontal', ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-row',
        className,
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list relative inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-auto group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  const resolvedVariant = variant ?? 'default'

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={resolvedVariant}
      className={cn(tabsListVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      <TabsHighlight variant={resolvedVariant} />
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-1.5 py-2 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground cursor-pointer focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'data-active:text-foreground dark:data-active:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none mt-4', className)}
      {...props}
    />
  )
}

type TabsVariant = 'default' | 'line'

interface TabHighlightBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Slides one highlight from the previous active tab to the one just chosen.
 * Base UI measures the active tab and exposes the box as CSS variables.
 * A resize of the tab list snaps the highlight so it stays stuck to the tab.
 */
function TabsHighlight({ variant }: { variant: TabsVariant }): ReactElement {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      render={(props, state) => (
        <SlidingTabHighlight
          variant={variant}
          orientation={state.orientation}
          renderProps={props}
        />
      )}
    />
  )
}

interface IndicatorRenderProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement> | undefined
}

interface SlidingTabHighlightProps {
  variant: TabsVariant
  orientation: 'horizontal' | 'vertical'
  renderProps: IndicatorRenderProps
}

function SlidingTabHighlight({
  variant,
  orientation,
  renderProps,
}: SlidingTabHighlightProps): ReactElement {
  const { style, hidden, role, id, ref, suppressHydrationWarning } = renderProps
  const reduceMotion = useReducedMotion()
  const hasSettled = useRef(false)
  const skipSlide = useRef(false)
  const highlightRef = useRef<HTMLSpanElement | null>(null)
  const externalRef = useRef(ref)
  const tab = measureActiveTab(style)
  const box = variant === 'line' ? toLineBox(tab, orientation) : tab
  const canShow = hidden !== true && tab.width > 0 && tab.height > 0
  const transition =
    hasSettled.current && !skipSlide.current && reduceMotion !== true
      ? SLIDE_TRANSITION
      : INSTANT_TRANSITION

  externalRef.current = ref

  const setHighlightRef = useCallback((node: HTMLSpanElement | null) => {
    highlightRef.current = node
    assignRef(externalRef.current, node)
  }, [])

  useLayoutEffect(() => {
    const parent = highlightRef.current?.parentElement
    if (!parent) return

    let lastWidth: number | null = null
    let lastHeight: number | null = null
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = Math.round(entry.contentRect.width)
      const height = Math.round(entry.contentRect.height)
      const isFirstMeasure = lastWidth === null || lastHeight === null
      const changed = width !== lastWidth || height !== lastHeight
      lastWidth = width
      lastHeight = height
      if (!isFirstMeasure && changed) skipSlide.current = true
    })
    observer.observe(parent)

    return () => observer.disconnect()
  }, [])

  // Clear after every paint. A later resize can mark the next move as a snap,
  // and the selection after that one slides again.
  useLayoutEffect(() => {
    if (canShow) hasSettled.current = true
    skipSlide.current = false
  })

  return (
    <motion.span
      ref={setHighlightRef}
      id={id}
      role={role}
      hidden={hidden}
      suppressHydrationWarning={suppressHydrationWarning}
      {...dataAttributeProps(renderProps)}
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-0 left-0 z-0',
        variant === 'line'
          ? 'rounded-full bg-foreground'
          : 'rounded-md bg-background shadow-sm dark:bg-input/30 dark:ring-1 dark:ring-inset dark:ring-input',
      )}
      initial={false}
      animate={{ x: box.x, y: box.y, width: box.width, height: box.height }}
      transition={transition}
      style={style}
    />
  )
}

function dataAttributeProps(
  props: HTMLAttributes<HTMLSpanElement>,
): Record<`data-${string}`, string | undefined> {
  const dataProps: Record<`data-${string}`, string | undefined> = {}
  for (const [key, value] of Object.entries(props)) {
    if (!key.startsWith('data-') || typeof value !== 'string') continue
    dataProps[key as `data-${string}`] = value
  }
  return dataProps
}

function assignRef(ref: Ref<HTMLSpanElement> | undefined, node: HTMLSpanElement | null): void {
  if (typeof ref === 'function') {
    ref(node)
    return
  }
  if (ref) ref.current = node
}

function measureActiveTab(style: CSSProperties | undefined): TabHighlightBox {
  return {
    x: readCssPx(style, '--active-tab-left'),
    y: readCssPx(style, '--active-tab-top'),
    width: readCssPx(style, '--active-tab-width'),
    height: readCssPx(style, '--active-tab-height'),
  }
}

function toLineBox(tab: TabHighlightBox, orientation: 'horizontal' | 'vertical'): TabHighlightBox {
  if (orientation === 'vertical') {
    return {
      x: tab.x + tab.width + 4 - LINE_THICKNESS_PX,
      y: tab.y,
      width: LINE_THICKNESS_PX,
      height: tab.height,
    }
  }

  return {
    x: tab.x,
    y: tab.y + tab.height + LINE_OFFSET_PX - LINE_THICKNESS_PX,
    width: tab.width,
    height: LINE_THICKNESS_PX,
  }
}

function readCssPx(style: CSSProperties | undefined, variable: string): number {
  if (!style) return 0
  const raw = style[variable as keyof CSSProperties]
  if (typeof raw === 'number') return raw
  if (typeof raw !== 'string') return 0
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
