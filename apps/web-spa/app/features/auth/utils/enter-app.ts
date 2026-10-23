import { markClubChoiceRequired } from '@/features/clubs/utils/club-session'

/**
 * Full navigation. A client-side route change can keep reading an older
 * host-only session cookie, so the session comes back empty.
 * The flag asks the home page to offer a club choice when the player belongs to several.
 */
export function enterApp(): void {
  markClubChoiceRequired()
  window.location.replace('/')
}
