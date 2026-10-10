export function isPlayerMissingError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  try {
    const body = JSON.parse(error.message) as { statusCode?: number }
    return body.statusCode === 404 || body.statusCode === 400
  } catch {
    return false
  }
}
