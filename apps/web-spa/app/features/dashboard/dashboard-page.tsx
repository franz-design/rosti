import { AppMobileHeader } from '@/common/components/layout/app-mobile-header'
import { AppToaster } from '@/common/components/app-toaster'
import { ClubProvider } from '@/features/clubs/hooks/club-context'
import { authClient } from '@/lib/auth-client'
import { AppLayout, AppLoader } from '@rosti/ui/components/app'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { AppMain } from '@/common/components/layout/app-main'
import { AppShellProvider } from '@/common/hooks/app-shell-context'
import { AppSidebar } from '@/common/components/layout/sidebar/app-sidebar'
import { AppBottomNav } from '@/common/components/layout/app-bottom-nav'

export default function DashboardPage() {
  const { data: sessionData, isPending } = authClient.useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isPending && !sessionData) {
      navigate('/login')
    }
  }, [sessionData, navigate, isPending])

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
          <AppBottomNav />
        </AppLayout>
        <AppToaster className="max-md:bottom-[calc(var(--bottom-nav-inset)+0.75rem)]!" />
      </ClubProvider>
    </AppShellProvider>
  )
}
