export type ShareMatchTextResult = 'shared' | 'copied'

/**
 * System share sheets on desktop (macOS especially) often omit a plain "Copy"
 * action. Prefer the share sheet only on touch-first devices.
 */
export function shouldUseSystemShare(
  share: Navigator['share'] | undefined = typeof navigator === 'undefined'
    ? undefined
    : navigator.share?.bind(navigator),
  matchesCoarsePointer: () => boolean = () =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
): boolean {
  return typeof share === 'function' && matchesCoarsePointer()
}

/**
 * Opens the system share sheet on touch devices, otherwise copies the text.
 * AbortError means the user dismissed the sheet — callers should stay silent.
 */
export async function shareMatchText(input: {
  title: string
  text: string
}): Promise<ShareMatchTextResult> {
  if (shouldUseSystemShare()) {
    try {
      await navigator.share({ title: input.title, text: input.text })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
    }
  }

  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard unavailable')
  }

  await navigator.clipboard.writeText(input.text)
  return 'copied'
}
