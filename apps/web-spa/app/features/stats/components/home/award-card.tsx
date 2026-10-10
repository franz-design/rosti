import { cn } from '@rosti/ui/lib/utils'
import { type CSSProperties, type PointerEvent } from 'react'
import electedArt from '@/assets/images/award-cards/last-elected-player.png'
import scorerArt from '@/assets/images/award-cards/meilleur-buteur.png'
import lossesArt from '@/assets/images/award-cards/most-defeats.png'
import winsArt from '@/assets/images/award-cards/most-wins.png'
import { getPlayerInitials } from '@/features/matches/utils/lineup-positions'
import type { PlayerHighlight } from '@/lib/rosti-api'
import './award-card.css'

type AwardCardVariant = 'scorer' | 'wins' | 'losses' | 'elected' | 'duo'

interface AwardCardCompanion {
  userName: string
  image?: string | null
}

interface AwardCardProps {
  variant: AwardCardVariant
  title: string
  statLabel?: string
  player: PlayerHighlight | null
  /** Second player, shown beside the first inside the portrait. */
  companion?: AwardCardCompanion | null
  /** Ribbon text. Defaults to the player's name. */
  nameLabel?: string
  emptyLabel: string
  /** Hides the number capsule. The elected card shows the player, not a count. */
  showStat?: boolean
  className?: string
}

const ARTWORK: Record<AwardCardVariant, string> = {
  scorer: scorerArt,
  wins: winsArt,
  losses: lossesArt,
  elected: electedArt,
  duo: winsArt,
}

/** Vignette and color wash, drawn only when a photo fills the portrait hole. */
const PORTRAIT_PHOTO =
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_50%_42%,transparent_46%,rgba(6,28,32,0.62)_100%)] before:mix-blend-multiply before:content-[""] after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[linear-gradient(118deg,transparent_16%,rgba(150,255,236,0.55)_40%,transparent_56%,rgba(255,170,110,0.4)_76%,transparent_92%)] after:mix-blend-soft-light after:content-[""]'

interface AwardCardSkin {
  portrait: string
  heading: string
  /** Top edge of the name ribbon. The stat pill sits just under it. */
  ribbonTop: string
  ribbon: string
  stat: string
  /** Recolors a shared frame so the duo card stays distinct. */
  artworkClass?: string
}

const SKIN: Record<AwardCardVariant, AwardCardSkin> = {
  scorer: {
    portrait: 'top-[27.42%] left-[24.8%] w-[51%] bg-[#102c32]',
    heading: 'top-[13.6%]',
    ribbonTop: 'calc(27.42% + 51% * 668 / 1024 - 3.6%)',
    ribbon:
      '[background-image:linear-gradient(#123844,#123844),linear-gradient(120deg,#7eefe8,#f3a0e4_42%,#ffe08a_72%,#8fd4ff)]',
    stat: 'bg-[linear-gradient(105deg,#0c4a58_0%,#1a8f98_42%,#c45a96_78%,#d4a04a_100%)]',
  },
  wins: {
    portrait: 'top-[26.73%] left-[23.45%] w-[54%] bg-[#1a140c]',
    heading: 'top-[13.6%]',
    ribbonTop: 'calc(26.73% + 54% * 668 / 1024 - 3.6%)',
    ribbon:
      '[background-image:linear-gradient(#24180a,#24180a),linear-gradient(120deg,#ffe08a,#7dffc3_48%,#e8b84a)]',
    stat: 'bg-[linear-gradient(105deg,#3a280c_0%,#8a5a14_46%,#d4a23a_78%,#2f6a3c_100%)]',
  },
  losses: {
    portrait: 'top-[27.25%] left-[24.3%] w-[52%] bg-[#1a1028]',
    heading: 'top-[13.6%]',
    ribbonTop: 'calc(27.25% + 52% * 668 / 1024 - 3.6%)',
    ribbon:
      '[background-image:linear-gradient(#2a1244,#2a1244),linear-gradient(120deg,#e89bff,#8ec6ff_46%,#ffb0ea)]',
    stat: 'bg-[linear-gradient(105deg,#3a1468_0%,#7a2eaa_40%,#c45ec4_74%,#5a78d0_100%)]',
  },
  elected: {
    portrait: 'top-[27.42%] left-[24.63%] w-[51.5%] bg-[#101428]',
    heading: 'top-[16%]',
    ribbonTop: 'calc(27.42% + 51.5% * 668 / 1024 - 3.6%)',
    ribbon:
      '[background-image:linear-gradient(#141833,#141833),linear-gradient(120deg,#e6c48a,#8eb6ff_52%,#d4a574)]',
    stat: 'bg-[linear-gradient(105deg,#14183a_0%,#2a4e98_38%,#7a3a86_72%,#c4a05a_100%)]',
  },
  duo: {
    portrait: 'top-[26.73%] left-[23.45%] w-[54%] bg-[#0c1a14]',
    heading: 'top-[13.6%]',
    ribbonTop: 'calc(26.73% + 54% * 668 / 1024 - 3.6%)',
    ribbon:
      '[background-image:linear-gradient(#0c2418,#0c2418),linear-gradient(120deg,#7dffc3,#8fd4ff_48%,#d8f08a)]',
    stat: 'bg-[linear-gradient(105deg,#0c3a28_0%,#1a8a5a_46%,#3a8a4a_78%,#145a40_100%)]',
    artworkClass: 'hue-rotate-[118deg] saturate-110',
  },
}

const EFFECT_LAYER = 'award-card-mask pointer-events-none absolute inset-0 z-[3]'

export function AwardCard({
  variant,
  title,
  statLabel,
  player,
  companion,
  nameLabel,
  emptyLabel,
  showStat = true,
  className,
}: AwardCardProps) {
  const artwork = ARTWORK[variant]
  const skin = SKIN[variant]
  const cardMask = {
    maskImage: `url("${artwork}")`,
    WebkitMaskImage: `url("${artwork}")`,
  } as CSSProperties

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
      style={
        {
          '--card-art': `url("${artwork}")`,
          '--award-ribbon-top': skin.ribbonTop,
        } as CSSProperties
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div
        className={cn(
          'relative h-full transition-transform duration-500 ease-[ease] motion-reduce:transform-none',
          '[transform:rotateX(var(--rotate-x))_rotateY(var(--rotate-y))_scale(var(--card-scale))]',
          'group-data-active:duration-[70ms] group-data-active:ease-linear',
        )}
      >
        <div
          className={cn(
            'absolute z-0 grid aspect-square place-items-center overflow-hidden',
            skin.portrait,
            (player?.image || companion?.image) && PORTRAIT_PHOTO,
          )}
        >
          {companion && player ? (
            <div className="flex size-full">
              <PortraitFace name={player.userName} image={player.image} />
              <PortraitFace name={companion.userName} image={companion.image} />
            </div>
          ) : player?.image ? (
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
          className={cn(
            'pointer-events-none absolute inset-0 z-[1] size-full',
            skin.artworkClass,
          )}
        />
        <div
          className={cn(
            'absolute z-2 -top-12 right-[8%] left-[8%] flex flex-col items-center gap-[0.7cqi] text-center text-[#fffdf8] uppercase',
            '[text-shadow:0_1px_1px_rgba(0,0,0,0.7),0_0_10px_rgba(0,16,32,0.45)]',
            'h-12 flex items-center justify-center',
            skin.heading,
          )}
        >
          <p className="font-display text-[7cqi] leading-none font-extrabold">{title}</p>
        </div>
        <p
          className={cn(
            'award-card-name absolute top-(--award-ribbon-top) left-[11%] z-4 isolate flex h-[10%] w-[78%] items-center justify-center overflow-hidden rounded-full border-[0.75cqi] border-transparent px-[9%] text-[#fff8f2]',
            'bg-origin-border [background-clip:padding-box,border-box]',
            skin.ribbon,
          )}
        >
          <span
            className={cn(
              'relative z-[1] min-w-0 truncate font-display leading-none',
              player
                ? companion
                  ? 'text-[5.2cqi] font-extrabold tracking-[0.01em]'
                  : 'text-[6.6cqi] font-extrabold tracking-[0.01em]'
                : 'text-[4.8cqi] font-bold tracking-[0.02em]',
            )}
          >
            {nameLabel ?? player?.userName ?? emptyLabel}
          </span>
        </p>
        {showStat && player && statLabel ? (
          <p
            className={cn(
              'award-card-stat absolute top-[calc(var(--award-ribbon-top)+12%)] left-1/2 z-4 flex h-[10%] w-max max-w-[76%] -translate-x-1/2 items-center justify-center overflow-hidden rounded-full px-[6cqi] text-[#fff8f2] lowercase border-2 border-white/10 border-box',
              'font-display text-md leading-none font-extrabold tracking-[0.02em]',
              skin.stat,
            )}
          >
            <span className="relative z-[1] truncate tabular-nums">
              {player.value} {statLabel}
            </span>
          </p>
        ) : null}
        <div
          aria-hidden="true"
          className={cn(
            EFFECT_LAYER,
            'bg-[linear-gradient(120deg,transparent_32%,rgba(255,255,255,0.9)_48%,transparent_64%)] opacity-[0.28] mix-blend-soft-light',
            '[background-position:var(--pointer-x)_var(--pointer-y)] [background-size:240%_240%]',
            'group-data-active:opacity-90',
          )}
          style={cardMask}
        />
        <div
          aria-hidden="true"
          className={cn(
            EFFECT_LAYER,
            'award-card-sheen mix-blend-color-dodge opacity-[0.22] group-data-active:opacity-50',
          )}
          style={cardMask}
        />
        <div
          aria-hidden="true"
          className={cn(
            EFFECT_LAYER,
            'bg-[radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.16)_26%,transparent_56%)] opacity-0 mix-blend-soft-light transition-opacity duration-300 ease-[ease]',
            'group-data-active:opacity-80',
          )}
          style={cardMask}
        />
      </div>
    </div>
  )
}

function PortraitFace({ name, image }: { name: string; image?: string | null }) {
  return (
    <span className="grid h-full w-1/2 place-items-center overflow-hidden">
      {image ? (
        <img src={image} alt="" className="size-full object-cover" />
      ) : (
        <span className="font-display text-[6cqi] font-bold tracking-[0.04em] text-[#fff4e8]">
          {getPlayerInitials(name)}
        </span>
      )}
    </span>
  )
}

function clampUnit(value: number): number {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}
