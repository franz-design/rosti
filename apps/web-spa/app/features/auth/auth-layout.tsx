import { Outlet } from 'react-router'
import { AppToaster } from '@/common/components/app-toaster'
import { AuthBrand } from './components/auth-brand'
import { CourtSlideshow } from './components/court-slideshow'

export default function AuthLayout() {
  return (
    <>
      <div className="flex h-svh md:p-4">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <AuthBrand />
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <Outlet />
            </div>
          </div>
        </div>
        <CourtSlideshow />
      </div>
      <AppToaster />
    </>
  )
}
