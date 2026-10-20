/**
 * Full navigation. A client-side route change can keep reading an older
 * host-only session cookie, so the session comes back empty.
 */
export function enterApp(): void {
  window.location.replace('/')
}
