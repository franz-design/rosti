import { cn } from '@rosti/ui/lib/utils'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { Toaster } from '@rosti/ui/components/primitives/sonner'

import { COURT_IMAGES } from '@/features/matches/court-by-sport'
import RostiLogo from '@/assets/images/rosti-logo.svg'

const FADE_INTERVAL_MS = 7000

export default function AuthLayout() {
  return (
    <>
      <div className="flex h-svh md:p-4">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="/" className="flex items-center gap-1">
              <img src={RostiLogo} alt="" className="size-7 rounded-md object-contain" />
              <span className="font-logo font-medium tracking-tight text-2xl text-primary">Rösti</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <Outlet />
            </div>
          </div>
        </div>
        <CourtSlideshow />
      </div>
      <Toaster position="bottom-right" richColors />
    </>
  )
}

function CourtSlideshow() {
  const [activeIndex, setActiveIndex] = useState<number>(0)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % COURT_IMAGES.length)
    }, FADE_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="relative hidden min-h-0 w-1/3 overflow-hidden rounded-xl lg:block">
      {COURT_IMAGES.map((courtSrc, index) => (
        <img
          key={courtSrc}
          src={courtSrc}
          alt=""
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none',
            index === activeIndex ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}
    </div>
  )
}
