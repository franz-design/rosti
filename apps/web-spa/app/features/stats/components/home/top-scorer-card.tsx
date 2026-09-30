import { cn } from '@rosti/ui/lib/utils'
import { type CSSProperties, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import awardCard from '@/assets/images/award-cards/meilleur-buteur.png'
import { getPlayerInitials } from '@/features/matches/utils/lineup-positions'
import type { PlayerHighlight } from '@/lib/rosti-api'
import './top-scorer-card.css'

interface TopScorerCardProps {
  player: PlayerHighlight
  className?: string
}

export function TopScorerCard({ player, className }: TopScorerCardProps) {
  const { t } = useTranslation()

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
      className={cn('top-scorer-card', className)}
      style={{ '--card-art': `url("${awardCard}")` } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div className="top-scorer-card__tilt">
        <div className="top-scorer-card__shell">
          <div className="top-scorer-card__portrait">
            {player.image ? (
              <img src={player.image} alt="" className="top-scorer-card__photo" />
            ) : (
              <span className="top-scorer-card__initials">
                {getPlayerInitials(player.userName)}
              </span>
            )}
          </div>
          <img src={awardCard} alt="" className="top-scorer-card__art" />
          <p className="top-scorer-card__name">
            <span>{player.userName}</span>
          </p>
          <p className="top-scorer-card__goals">
            <span className="sr-only">{t('home.stats.goals')}</span>
            {player.value}
          </p>
          <div className="top-scorer-card__foil" aria-hidden="true" />
          <div className="top-scorer-card__sheen" aria-hidden="true" />
          <div className="top-scorer-card__glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

function clampUnit(value: number): number {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}
