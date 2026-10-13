const MAX_TITLE_LENGTH = 80
const MAX_BODY_LENGTH = 140

export interface ChatPushPayload {
  title: string
  body: string
  event: 'chat_mention' | 'chat_message'
  organizationId: string
  matchId: string
  url: string
}

export function chatPush(input: {
  isMention: boolean
  organizationId: string
  matchId: string
  matchTitle: string
  authorName: string
  body: string
}): ChatPushPayload {
  const author = oneLine(input.authorName) || 'Un joueur'
  const excerpt = oneLine(input.body)
  const title = input.isMention ? `${author} te mentionne` : author
  const body = excerpt || oneLine(input.matchTitle) || 'Nouveau message'

  return {
    title: title.slice(0, MAX_TITLE_LENGTH),
    body: body.slice(0, MAX_BODY_LENGTH),
    event: input.isMention ? 'chat_mention' : 'chat_message',
    organizationId: input.organizationId,
    matchId: input.matchId,
    url: `/matches/${input.matchId}?tab=chat&organizationId=${input.organizationId}`,
  }
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}
