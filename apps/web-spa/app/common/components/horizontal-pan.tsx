import { cn } from '@rosti/ui/lib/utils'
import { useRef, type ReactNode } from 'react'
import { useHorizontalPan } from '../hooks/use-horizontal-pan'

/**
 * Clips a wide row and slides it sideways.
 * The frame is not a scroll container, so on iPhone it does not stop the page
 * when the row reaches the top of the screen.
 */
export function HorizontalPan({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  useHorizontalPan(frameRef)

  return (
    <div ref={frameRef} className={cn('w-fit max-w-full min-w-0 overflow-clip', className)}>
      {children}
    </div>
  )
}
