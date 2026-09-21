export type HighlightTone = 'info' | 'primary' | 'success' | 'destructive' | 'team'

export const HIGHLIGHT_TONE_CLASS: Record<HighlightTone, string> = {
  info: 'bg-info/10 text-info',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
  team: 'bg-team-blue/10 text-team-blue',
}
