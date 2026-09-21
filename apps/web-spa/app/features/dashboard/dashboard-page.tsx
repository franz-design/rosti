import { AppLayout, AppLoader } from '@rosti/ui/components/app'
import { Toaster } from '@rosti/ui/components/primitives/sonner'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { ClubProvider } from '@/features/clubs/hooks/club-context'
import { authClient } from '@/lib/auth-client'
import { AppBottomNav } from './components/app-bottom-nav'
import { CommandPalette } from './components/command-palette'
import { AppSidebar } from './components/sidebar/app-sidebar'

export default function DashboardPage() {
  const { data: sessionData, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    if (!isPending && !sessionData) {
      navigate('/login')
    }
  }, [sessionData, navigate, isPending])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isPending) {
    return <AppLoader />
  }

  if (!sessionData) {
    return null
  }

  return (
    <ClubProvider>
      <AppLayout sidebar={<AppSidebar />}>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-6 max-md:pb-[calc(1.5rem+var(--bottom-nav-height))]">
          <Outlet />
        </main>
      </AppLayout>

      <AppBottomNav />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <Toaster
        position="bottom-right"
        richColors
        className="max-md:!bottom-[calc(var(--bottom-nav-height)+0.75rem)]"
      />
    </ClubProvider>
  )
}
