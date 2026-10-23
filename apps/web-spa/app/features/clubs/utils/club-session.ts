export const ACTIVE_CLUB_STORAGE_KEY = 'rosti.activeClubId'

const CLUB_CHOICE_REQUIRED_KEY = 'rosti.pickClub'

export function markClubChoiceRequired(): void {
  sessionStorage.setItem(CLUB_CHOICE_REQUIRED_KEY, '1')
}

export function isClubChoiceRequired(): boolean {
  return sessionStorage.getItem(CLUB_CHOICE_REQUIRED_KEY) === '1'
}

export function clearClubChoiceRequired(): void {
  sessionStorage.removeItem(CLUB_CHOICE_REQUIRED_KEY)
}

export function readStoredClubId(): string | null {
  return localStorage.getItem(ACTIVE_CLUB_STORAGE_KEY)
}

export function storeActiveClubId(clubId: string): void {
  localStorage.setItem(ACTIVE_CLUB_STORAGE_KEY, clubId)
}
