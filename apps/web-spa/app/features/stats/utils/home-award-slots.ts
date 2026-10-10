import type { PlayerHighlight } from '@/lib/rosti-api'

/** Home shows at most two award cards. Portraits get noisy past that. */
export const HOME_AWARD_SLOT_LIMIT = 2

const RECORD_VARIANTS = ['scorer', 'wins', 'losses'] as const

export type SeasonRecordVariant = (typeof RECORD_VARIANTS)[number]

export interface HomeAwardPlayer {
  userId: string
  userName: string
  image?: string | null
}

export interface HomeAwardDuo {
  playerA: HomeAwardPlayer
  playerB: HomeAwardPlayer
  matchesTogether: number
}

export type HomeAwardSlot =
  | { kind: 'elected'; player: PlayerHighlight }
  | { kind: 'vote'; matchId: string }
  | { kind: 'record'; variant: SeasonRecordVariant; player: PlayerHighlight }
  | ({ kind: 'duo' } & HomeAwardDuo)

export interface HomeAwardClub {
  matchesPlayed: number
  topScorer: PlayerHighlight | null
  mostWins: PlayerHighlight | null
  mostLosses: PlayerHighlight | null
  mostPlayedTogether: HomeAwardDuo | null
  lastElectedPlayer: HomeAwardPlayer | null
  openPlayerVoteMatchId: string | null
}

type SeasonRecordSlot = Extract<HomeAwardSlot, { kind: 'record' }>
type RotatingSlot = Extract<HomeAwardSlot, { kind: 'record' | 'duo' }>

/**
 * Picks the award cards for the home page.
 * The first slot is the last match's elected player, or a vote prompt while that vote is open.
 * The remaining slots rotate through season records and the teammate duo, and move on each played match.
 */
export function selectHomeAwardSlots(club: HomeAwardClub): HomeAwardSlot[] {
  const rotating = listRotating(club)
  const featured = featuredSlot(club)
  if (!featured) return takeRotating(rotating, club.matchesPlayed, HOME_AWARD_SLOT_LIMIT)

  const featuredUserId = featured.kind === 'elected' ? featured.player.userId : null
  const others = rotating.filter((slot) => !isFeaturedPlayer(slot, featuredUserId))
  const pool = others.length > 0 ? others : rotating
  return [featured, ...takeRotating(pool, club.matchesPlayed, HOME_AWARD_SLOT_LIMIT - 1)]
}

export function hasClubHomeHighlights(club: HomeAwardClub): boolean {
  return selectHomeAwardSlots(club).length > 0
}

function featuredSlot(club: HomeAwardClub): HomeAwardSlot | null {
  if (club.lastElectedPlayer) {
    return { kind: 'elected', player: { ...club.lastElectedPlayer, value: 0 } }
  }
  if (club.openPlayerVoteMatchId) {
    return { kind: 'vote', matchId: club.openPlayerVoteMatchId }
  }
  return null
}

function isFeaturedPlayer(slot: RotatingSlot, featuredUserId: string | null): boolean {
  if (!featuredUserId || slot.kind === 'duo') return false
  return slot.player.userId === featuredUserId
}

function listRotating(club: HomeAwardClub): RotatingSlot[] {
  const slots: RotatingSlot[] = listSeasonRecords(club)
  if (club.mostPlayedTogether) slots.push({ kind: 'duo', ...club.mostPlayedTogether })
  return slots
}

function listSeasonRecords(club: HomeAwardClub): SeasonRecordSlot[] {
  const players: Record<SeasonRecordVariant, PlayerHighlight | null> = {
    scorer: club.topScorer,
    wins: club.mostWins,
    losses: club.mostLosses,
  }

  return RECORD_VARIANTS.flatMap((variant) => {
    const player = players[variant]
    if (!player) return []
    return [{ kind: 'record' as const, variant, player }]
  })
}

function takeRotating(slots: RotatingSlot[], matchesPlayed: number, count: number): RotatingSlot[] {
  if (slots.length === 0 || count <= 0) return []
  const start = positiveMod(matchesPlayed, slots.length)
  const limit = Math.min(count, slots.length)
  return Array.from({ length: limit }, (_, offset) => slots[(start + offset) % slots.length])
}

function positiveMod(value: number, divisor: number): number {
  if (divisor <= 0) return 0
  return ((value % divisor) + divisor) % divisor
}
