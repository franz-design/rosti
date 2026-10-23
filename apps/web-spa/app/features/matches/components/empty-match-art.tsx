import ballDark from '@/assets/images/empty/ball-dark.png'
import ball from '@/assets/images/empty/ball.png'
import benchDark from '@/assets/images/empty/bench-dark.png'
import bench from '@/assets/images/empty/bench.png'
import whistleDark from '@/assets/images/empty/whistle-dark.png'
import whistle from '@/assets/images/empty/whistle.png'
import { cn } from '@rosti/ui/lib/utils'

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

type EmptyMatchArtName = keyof typeof ART

interface EmptyMatchArtProps {
  name: EmptyMatchArtName
  /** Size of the area. The picture's own classes place it inside. */
  className?: string
}

export function EmptyMatchArt({ name, className }: EmptyMatchArtProps) {
  const art = ART[name]

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <img src={art.light} alt="" className={cn('w-full dark:hidden', art.className)} />
      <img src={art.dark} alt="" className={cn('hidden w-full dark:block', art.className)} />
    </div>
  )
}
