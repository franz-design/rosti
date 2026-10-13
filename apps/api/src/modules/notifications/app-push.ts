export type AppPushEvent =
  | 'chat_mention'
  | 'chat_message'
  | 'match_invite'
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
