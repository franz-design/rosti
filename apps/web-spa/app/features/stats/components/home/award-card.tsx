import { CloudRainFilled, CupFilled, Football, StarFilled, type SolarIcon } from '@rosti/ui/icons'
import { cn } from '@rosti/ui/lib/utils'
import { type CSSProperties, type PointerEvent } from 'react'
import electedArt from '@/assets/images/award-cards/last-elected-player.png'
import scorerArt from '@/assets/images/award-cards/meilleur-buteur.png'
import lossesArt from '@/assets/images/award-cards/most-defeats.png'
import winsArt from '@/assets/images/award-cards/most-wins.png'
import { getPlayerInitials } from '@/features/matches/utils/lineup-positions'
import type { PlayerHighlight } from '@/lib/rosti-api'
import './award-card.css'

type AwardCardVariant = 'scorer' | 'wins' | 'losses' | 'elected'

interface AwardCardProps {
  variant: AwardCardVariant
  title: string
  subtitle: string
  statLabel?: string
  player: PlayerHighlight | null
  emptyLabel: string
  /** Hides the number capsule. Used for the elected card until that vote exists. */
  showStat?: boolean
  className?: string
}

const ARTWORK: Record<AwardCardVariant, string> = {
  scorer: scorerArt,
  wins: winsArt,
  losses: lossesArt,
  elected: electedArt,
}

const BADGE_ICON: Record<AwardCardVariant, SolarIcon> = {
  scorer: Football,
  wins: CupFilled,
  losses: CloudRainFilled,
  elected: StarFilled,
}

/** Vignette and color wash, drawn only when a photo fills the portrait hole. */
const PORTRAIT_PHOTO =
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_50%_42%,transparent_46%,rgba(6,28,32,0.62)_100%)] before:mix-blend-multiply before:content-[""] after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[linear-gradient(118deg,transparent_16%,rgba(150,255,236,0.55)_40%,transparent_56%,rgba(255,170,110,0.4)_76%,transparent_92%)] after:mix-blend-soft-light after:content-[""]'

interface AwardCardSkin {
  portrait: string
  heading: string
  ribbon: string
  badge: string
  badgeValue: string
}

const SKIN: Record<AwardCardVariant, AwardCardSkin> = {
  scorer: {
    portrait: 'top-[27.42%] left-[24.8%] w-[51%] bg-[#102c32]',
    heading: 'top-[13.6%]',
    ribbon:
      'top-[calc(27.42%+51%*668/1024-3.6%)] [background-image:linear-gradient(#123844,#123844),linear-gradient(120deg,#7eefe8,#f3a0e4_42%,#ffe08a_72%,#8fd4ff)]',
    badge: 'bg-[#a31834]',
    badgeValue: 'bg-[#d2653e] text-[#fff8f2]',
  },
  wins: {
    portrait: 'top-[26.73%] left-[23.45%] w-[54%] bg-[#1a140c]',
    heading: 'top-[13.6%]',
    ribbon:
      'top-[calc(26.73%+54%*668/1024-3.6%)] [background-image:linear-gradient(#24180a,#24180a),linear-gradient(120deg,#ffe08a,#7dffc3_48%,#e8b84a)]',
    badge: 'bg-[#6e4a10]',
    badgeValue: 'bg-[#e2b34a] text-[#3d2808]',
  },
  losses: {
    portrait: 'top-[27.25%] left-[24.3%] w-[52%] bg-[#1a1028]',
    heading: 'top-[13.6%]',
    ribbon:
      'top-[calc(27.25%+52%*668/1024-3.6%)] [background-image:linear-gradient(#2a1244,#2a1244),linear-gradient(120deg,#e89bff,#8ec6ff_46%,#ffb0ea)]',
    badge: 'bg-[#5b2494]',
    badgeValue: 'bg-[#e7a6e4] text-[#3b1248]',
  },
  elected: {
    portrait: 'top-[27.42%] left-[24.63%] w-[51.5%] bg-[#101428]',
    heading: 'top-[16%]',
    ribbon:
      'top-[calc(27.42%+51.5%*668/1024-3.6%)] [background-image:linear-gradient(#141833,#141833),linear-gradient(120deg,#e6c48a,#8eb6ff_52%,#d4a574)]',
    badge: 'bg-[#6b4a28]',
    badgeValue: 'bg-[#e6c48a] text-[#3a2610]',
  },
}

const EFFECT_LAYER = 'award-card-mask pointer-events-none absolute inset-0 z-[3]'

export function AwardCard({
  variant,
  title,
  subtitle,
  player,
  emptyLabel,
  showStat = true,
  className,
}: AwardCardProps) {
  const artwork = ARTWORK[variant]
  const skin = SKIN[variant]
  const BadgeIcon = BADGE_ICON[variant]

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    if (event.pointerType !== 'mouse') return
    const node = event.currentTarget
    const bounds = node.getBoundingClientRect()
    const x = clampUnit((event.clientX - bounds.left) / bounds.width)
    const y = clampUnit((event.clientY - bounds.top) / bounds.height)
    node.dataset.active = ''
    node.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`)
    node.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`)
    node.style.setProperty('--rotate-x', `${((0.5 - y) * 14).toFixed(2)}deg`)
    node.style.setProperty('--rotate-y', `${((x - 0.5) * 18).toFixed(2)}deg`)
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>): void {
    const node = event.currentTarget
    delete node.dataset.active
    node.style.setProperty('--pointer-x', '50%')
    node.style.setProperty('--pointer-y', '16%')
    node.style.setProperty('--rotate-x', '0deg')
    node.style.setProperty('--rotate-y', '0deg')
  }

  return (
    <div
      className={cn(
        'group @container relative aspect-[668/1024] w-full perspective-[980px] select-none',
        '[--pointer-x:50%] [--pointer-y:16%] [--rotate-x:0deg] [--rotate-y:0deg] [--card-scale:1]',
        'data-active:[--card-scale:1.02]',
        className,
      )}
      style={{ '--card-art': `url("${artwork}")` } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div
        className={cn(
          'relative h-full transform-3d transition-transform duration-500 ease-[ease] motion-reduce:transform-none',
          '[transform:rotateX(var(--rotate-x))_rotateY(var(--rotate-y))_scale(var(--card-scale))]',
          'group-data-active:duration-[70ms] group-data-active:ease-linear',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 transition-[filter] duration-[350ms] ease-[ease]',
            '[filter:drop-shadow(0_14px_16px_rgba(0,0,0,0.38))]',
            'group-data-active:[filter:drop-shadow(0_18px_18px_rgba(0,0,0,0.42))_drop-shadow(0_0_14px_rgba(120,255,220,0.45))]',
          )}
        >
          <div
            className={cn(
              'absolute z-0 grid aspect-square place-items-center overflow-hidden',
              skin.portrait,
              player?.image && PORTRAIT_PHOTO,
            )}
          >
            {player?.image ? (
              <img src={player.image} alt="" className="size-full object-cover" />
            ) : player ? (
              <span className="font-display text-[9cqi] font-bold tracking-[0.04em] text-[#fff4e8]">
                {getPlayerInitials(player.userName)}
              </span>
            ) : null}
          </div>
          <img
            src={artwork}
            alt=""
            className="pointer-events-none absolute inset-0 z-[1] size-full"
          />
          <div
            className={cn(
              'absolute z-2 right-[8%] left-[8%] flex flex-col items-center gap-[0.7cqi] text-center text-[#fffdf8] uppercase',
              '[text-shadow:0_1px_1px_rgba(0,0,0,0.7),0_0_10px_rgba(0,16,32,0.45)]',
              skin.heading,
            )}
          >
            <p className="font-display text-[5.35cqi] leading-none font-extrabold tracking-[0.03em]">
              {title}
            </p>
            <p className="font-display text-[3.55cqi] leading-none font-bold tracking-[0.14em]">
              {subtitle}
            </p>
          </div>
          {showStat && player ? (
            <div className="absolute top-[29%] left-[67.2%] z-4 isolate flex h-[25%] w-[20.8%] flex-col overflow-hidden rounded-full">
              <div
                className={cn(
                  'flex flex-[1.1] items-center justify-center text-[#fff8f2]',
                  skin.badge,
                )}
              >
                <BadgeIcon className="size-8" aria-hidden="true" />
              </div>
              <p
                className={cn(
                  'flex flex-[0.9] items-center justify-center font-display text-[7.6cqi] leading-none font-extrabold tabular-nums',
                  skin.badgeValue,
                )}
              >
                {player.value}
              </p>
            </div>
          ) : null}
          <p
            className={cn(
              'absolute left-[11%] z-4 isolate flex h-[10%] w-[78%] items-center justify-center overflow-hidden rounded-lg border-[0.75cqi] border-transparent px-[9%] text-[#fff8f2]',
              'bg-origin-border shadow-[0_0.7cqi_1.6cqi_rgba(0,0,0,0.34)] [background-clip:padding-box,border-box]',
              skin.ribbon,
            )}
          >
            <span
              className={cn(
                'min-w-0 truncate font-display leading-none',
                player
                  ? 'text-[6.6cqi] font-extrabold tracking-[0.01em]'
                  : 'text-[4.8cqi] font-bold tracking-[0.02em]',
              )}
            >
              {player?.userName ?? emptyLabel}
            </span>
          </p>
          <div
            aria-hidden="true"
            className={cn(
              EFFECT_LAYER,
              'bg-[linear-gradient(120deg,transparent_32%,rgba(255,255,255,0.9)_48%,transparent_64%)] opacity-[0.28] mix-blend-soft-light',
              '[background-position:var(--pointer-x)_var(--pointer-y)] [background-size:240%_240%]',
              'group-data-active:opacity-90',
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              EFFECT_LAYER,
              'award-card-sheen mix-blend-color-dodge opacity-[0.22] group-data-active:opacity-50',
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              EFFECT_LAYER,
              'bg-[radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.16)_26%,transparent_56%)] opacity-0 mix-blend-soft-light transition-opacity duration-300 ease-[ease]',
              'group-data-active:opacity-80',
            )}
          />
        </div>
      </div>
    </div>
  )
}

function clampUnit(value: number): number {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}
