import { Toaster } from '@rosti/ui/components/primitives/sonner'
import type { ComponentProps } from 'react'
import useTheme from '@/hooks/useTheme'

export function AppToaster(props: ComponentProps<typeof Toaster>) {
  const [theme] = useTheme()

  return <Toaster theme={theme} position="bottom-right" {...props} />
}
