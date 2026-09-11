import { Outlet } from 'react-router'
import { Toaster } from '@rosti/ui/components/primitives/sonner'

import footballCourt from '@/assets/images/courts/football.jpg'
import RostiLogo from '@/assets/images/rosti-logo.svg'

export default function AuthLayout() {
  return (
    <>
      <div className="flex h-svh md:p-4">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="/" className="flex items-center gap-1">
              <img src={RostiLogo} alt="" className="size-7 rounded-md object-contain" />
              <span className="font-logo font-medium tracking-tight text-2xl">Rösti</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <Outlet />
            </div>
          </div>
        </div>
        <div className="relative hidden min-h-0 flex-1 overflow-hidden rounded-xl lg:block">
          <img src={footballCourt} alt="" className="absolute inset-0 size-full object-cover" />
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </>
  )
}
