import type { SportType } from '@/lib/rosti-api'

export type EmptyBallKind =
  | 'football'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'padel'
  | 'badminton'

export function emptyBallKindForSport(sportType: SportType | null | undefined): EmptyBallKind {
  switch (sportType) {
    case 'basketball':
    case 'volleyball':
    case 'tennis':
    case 'padel':
    case 'badminton':
      return sportType
    default:
      return 'football'
  }
}
