import { AppLayout, AppLoader } from '@rosti/ui/components/app'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { AppToaster } from '@/common/components/app-toaster'
import { ClubProvider } from '@/features/clubs/hooks/club-context'
import { authClient } from '@/lib/auth-client'
import { AppBottomNav } from './components/app-bottom-nav'
import { AppMain } from './components/app-main'
import { AppMobileHeader } from './components/app-mobile-header'
import { CommandPalette } from './components/command-palette'
import { AppSidebar } from './components/sidebar/app-sidebar'
import { AppShellProvider } from './hooks/app-shell-context'

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
    <AppShellProvider>
      <ClubProvider>
        <AppLayout sidebar={<AppSidebar />}>
          <AppMobileHeader />
          <AppMain>
            <Outlet />
          </AppMain>
        </AppLayout>

        <AppBottomNav />

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

        <AppToaster className="max-md:bottom-[calc(var(--bottom-nav-inset)+0.75rem)]!" />
      </ClubProvider>
    </AppShellProvider>
  )
}
