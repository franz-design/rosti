import { cn } from '@rosti/ui/lib/utils'
import { useEffect, useState } from 'react'
import { COURT_IMAGES } from '@/features/matches/utils/court-by-sport'

const FADE_INTERVAL_MS = 7000

export function CourtSlideshow() {
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
