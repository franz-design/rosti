import type { ReactNode } from 'react'
import { cn } from '@rosti/ui/lib/utils'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@rosti/ui/components/primitives/sidebar'
import { Separator } from '@rosti/ui/components/primitives/separator'
import { useViewportHeight } from '@rosti/ui/hooks/use-viewport-height'

interface AppLayoutProps {
  sidebar: ReactNode
  header?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

/**
 * Generic app shell: collapsible sidebar + header + main content area.
 * Pass a `<Sidebar>` tree from primitives/sidebar as `sidebar`.
 *
 * The shell is pinned to the visible viewport so the document itself never scrolls;
 * scrolling belongs to the regions `children` marks as scrollable.
 *
 * @example
 * <AppLayout sidebar={<AppSidebar />}>
 *   <main>...</main>
 * </AppLayout>
 */
export function AppLayout({
  sidebar,
  header,
  children,
  defaultOpen = true,
  className,
}: AppLayoutProps) {
  useViewportHeight()

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="fixed inset-x-0 top-(--app-viewport-offset) h-(--app-height) min-h-0 overflow-hidden"
    >
      {sidebar}
      <SidebarInset className={cn('flex min-h-0 flex-col overflow-hidden', className)}>
        {header !== undefined ? <AppLayoutHeader>{header}</AppLayoutHeader> : null}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

interface AppLayoutHeaderProps {
  children?: ReactNode
  className?: string
  showTrigger?: boolean
}

export function AppLayoutHeader({ children, className, showTrigger = true }: AppLayoutHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12',
        className,
      )}
    >
      {showTrigger ? (
        <>
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {children ? <Separator orientation="vertical" className="mr-2 h-4" /> : null}
          </div>
        </>
      ) : null}
      {children ? <div className="flex flex-1 items-center gap-2 px-4">{children}</div> : null}
    </header>
  )
}
