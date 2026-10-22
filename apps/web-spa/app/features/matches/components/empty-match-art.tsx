import ball from '@/assets/images/empty/ball.png'
import bench from '@/assets/images/empty/bench.png'
import whistle from '@/assets/images/empty/whistle.png'
import { cn } from '@rosti/ui/lib/utils'

const ART = {
  ball,
  bench,
  whistle,
} as const

type EmptyMatchArtName = keyof typeof ART

interface EmptyMatchArtProps {
  name: EmptyMatchArtName
  className?: string
}

export function EmptyMatchArt({ name, className }: EmptyMatchArtProps) {
  return (
    <img
      src={ART[name]}
      alt=""
      className={cn(
        'h-24 w-auto max-w-full object-contain drop-shadow-[0_10px_12px_rgb(0_0_0/0.14)]',
        className,
      )}
    />
  )
}
