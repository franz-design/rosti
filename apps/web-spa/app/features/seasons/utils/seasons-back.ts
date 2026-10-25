export const SEASONS_BACK_FALLBACK = '/club-settings?tab=matches'

export function resolveSeasonsBackTarget(historyIndex: unknown): -1 | string {
  if (typeof historyIndex === 'number' && Number.isInteger(historyIndex) && historyIndex > 0) {
    return -1
  }
  return SEASONS_BACK_FALLBACK
}
