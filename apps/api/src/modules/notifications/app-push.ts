export type AppPushEvent =
  | 'chat_mention'
  | 'chat_message'
  | 'match_invite'
  | 'match_cancelled'
  | 'fee_request'
  | 'fee_reminder'
  | 'rsvp_reminder'
  | 'score_reminder'
  | 'player_vote_opened'
  | 'player_vote_result'

export interface AppPushPayload {
  title: string
  body: string
  event: AppPushEvent
  organizationId: string
  matchId: string
  url: string
}

export type MatchPushTab = 'summary' | 'chat' | 'stats' | 'payments'

export function matchPushUrl(input: {
  matchId: string
  organizationId: string
  tab: MatchPushTab
}): string {
  const params = new URLSearchParams({
    tab: input.tab,
    organizationId: input.organizationId,
  })
  return `/matches/${input.matchId}?${params.toString()}`
}
