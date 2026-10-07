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

export function AwardCard({
  variant,
  title,
  subtitle,
  statLabel,
  player,
  emptyLabel,
  showStat = true,
  className,
}: AwardCardProps) {
  const artwork = ARTWORK[variant]
  const BadgeIcon = BADGE_ICON[variant]

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    if (event.pointerType !== 'mouse') return
    const node = event.currentTarget
    const bounds = node.getBoundingClientRect()
    const x = clampUnit((event.clientX - bounds.left) / bounds.width)
    const y = clampUnit((event.clientY - bounds.top) / bounds.height)
    node.classList.add('is-active')
    node.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`)
    node.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`)
    node.style.setProperty('--rotate-x', `${((0.5 - y) * 14).toFixed(2)}deg`)
    node.style.setProperty('--rotate-y', `${((x - 0.5) * 18).toFixed(2)}deg`)
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>): void {
    const node = event.currentTarget
    node.classList.remove('is-active')
    node.style.setProperty('--pointer-x', '50%')
    node.style.setProperty('--pointer-y', '16%')
    node.style.setProperty('--rotate-x', '0deg')
    node.style.setProperty('--rotate-y', '0deg')
  }

  return (
    <div
      className={cn('award-card', `award-card--${variant}`, className)}
      style={{ '--card-art': `url("${artwork}")` } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div className="award-card__tilt">
        <div className="award-card__shell">
          <div className="award-card__portrait">
            {player?.image ? (
              <img src={player.image} alt="" className="award-card__photo" />
            ) : player ? (
              <span className="award-card__initials">{getPlayerInitials(player.userName)}</span>
            ) : null}
          </div>
          <img src={artwork} alt="" className="award-card__art" />
          <div className="award-card__heading">
            <p className="award-card__title">{title}</p>
            <p className="award-card__subtitle">{subtitle}</p>
          </div>
          {showStat && player ? (
            <div className="award-card__badge">
              <div className="award-card__badge-head">
                <BadgeIcon className="award-card__badge-icon" aria-hidden="true" />
                <span>{statLabel}</span>
              </div>
              <p className="award-card__badge-value">{player.value}</p>
            </div>
          ) : null}
          <p className={cn('award-card__ribbon', !player && 'is-empty')}>
            <span>{player?.userName ?? emptyLabel}</span>
          </p>
          <div className="award-card__foil" aria-hidden="true" />
          <div className="award-card__sheen" aria-hidden="true" />
          <div className="award-card__glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

function clampUnit(value: number): number {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}
