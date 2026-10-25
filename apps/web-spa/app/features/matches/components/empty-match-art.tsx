import badmintonDark from '@/assets/images/empty/badminton-dark.png'
import badminton from '@/assets/images/empty/badminton.png'
import ballDark from '@/assets/images/empty/ball-dark.png'
import ball from '@/assets/images/empty/ball.png'
import basketballDark from '@/assets/images/empty/basketball-dark.png'
import basketball from '@/assets/images/empty/basketball.png'
import benchDark from '@/assets/images/empty/bench-dark.png'
import bench from '@/assets/images/empty/bench.png'
import padelDark from '@/assets/images/empty/padel-dark.png'
import padel from '@/assets/images/empty/padel.png'
import tennisDark from '@/assets/images/empty/tennis-dark.png'
import tennis from '@/assets/images/empty/tennis.png'
import volleyballDark from '@/assets/images/empty/volleyball-dark.png'
import volleyball from '@/assets/images/empty/volleyball.png'
import whistleDark from '@/assets/images/empty/whistle-dark.png'
import whistle from '@/assets/images/empty/whistle.png'
import { cn } from '@rosti/ui/lib/utils'
import type { SportType } from '@/lib/rosti-api'
import { emptyBallKindForSport, type EmptyBallKind } from '../utils/ball-by-sport'

const ART = {
  ball: {
    light: ball,
    dark: ballDark,
    className: '-mr-26 -mt-12',
  },
  bench: {
    light: bench,
    dark: benchDark,
    className: '-mr-26 -mt-4 -mb-4',
  },
  whistle: {
    light: whistle,
    dark: whistleDark,
    className: 'w-1/2',
  },
} as const

const BALLS: Record<EmptyBallKind, { light: string; dark: string; className: string }> = {
  football: { light: ball, dark: ballDark, className: '' },
  basketball: { light: basketball, dark: basketballDark, className: '-mr-32 -mb-12' },
  volleyball: { light: volleyball, dark: volleyballDark, className: '-mr-32 -mb-12' },
  tennis: { light: tennis, dark: tennisDark, className: '-mr-36 -mb-12' },
  padel: { light: padel, dark: padelDark, className: '-mr-34' },
  badminton: { light: badminton, dark: badmintonDark, className: '-mr-48 -mb-12' },
}

type EmptyMatchArtName = keyof typeof ART

interface EmptyMatchArtProps {
  name: EmptyMatchArtName
  sportType?: SportType | null
  /**
   * Skip the crop offsets tuned for the large empty cards.
   * Use this when the picture sits beside real content.
   */
  contained?: boolean
  /** Size of the area. The picture's own classes place it inside. */
  className?: string
}

export function EmptyMatchArt({
  name,
  sportType,
  contained = false,
  className,
}: EmptyMatchArtProps) {
  const ballKind = name === 'ball' ? emptyBallKindForSport(sportType) : null
  const ball = ballKind ? BALLS[ballKind] : null
  const art = ball
    ? { light: ball.light, dark: ball.dark, className: cn(ART.ball.className, ball.className) }
    : ART[name]
  // Sport balls other than football are opaque white or black rectangles.
  // Blending hides that rectangle on the page background.
  const blendOpaque = ballKind !== null && ballKind !== 'football'

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <img
        src={art.light}
        alt=""
        className={cn(
          'w-full dark:hidden',
          !contained && art.className,
          blendOpaque && 'mix-blend-darken',
        )}
      />
      <img
        src={art.dark}
        alt=""
        className={cn(
          'hidden w-full dark:block',
          !contained && art.className,
          blendOpaque && 'mix-blend-lighten',
        )}
      />
    </div>
  )
}
