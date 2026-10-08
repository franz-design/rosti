export function registerProductionServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return
  void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
}
