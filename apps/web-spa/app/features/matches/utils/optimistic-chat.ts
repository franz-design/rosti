import type { MatchMessage } from '@/lib/rosti-api'
import { extractMentionIds, toPlainMentionBody } from './chat-mentions'

export function messagesQueryKey(orgId: string | undefined, matchId: string | undefined) {
  return ['messages', orgId, matchId] as const
}

export interface OptimisticMessageInput {
  clientId: string
  matchId: string
  authorId: string
  authorName: string
  authorImage?: string | null
  markup: string
  createdAt: string
}

/** A message shown in the thread before the server has it. */
export interface OutgoingChatMessage {
  clientId: string
  matchId: string
  markup: string
  confirmedId?: string
  message: MatchMessage
}

/** Builds the bubble shown the moment the player hits send. */
export function buildOptimisticMessage(input: OptimisticMessageInput): MatchMessage {
  return {
    id: input.clientId,
    matchId: input.matchId,
    authorId: input.authorId,
    authorName: input.authorName,
    authorImage: input.authorImage,
    body: toPlainMentionBody(input.markup),
    mentionedUserIds: extractMentionIds(input.markup),
    createdAt: input.createdAt,
  }
}

/**
 * Appends messages that are not on the server yet.
 * A confirmed send drops out once the loaded list contains its server id.
 */
export function mergeOutgoingMessages(
  serverMessages: MatchMessage[],
  outgoing: OutgoingChatMessage[],
  matchId: string | undefined,
): MatchMessage[] {
  const serverIds = new Set(serverMessages.map((item) => item.id))
  const pending = outgoing
    .filter((item) => item.matchId === matchId)
    .filter((item) => !item.confirmedId || !serverIds.has(item.confirmedId))
    .map((item) => item.message)
  return [...serverMessages, ...pending]
}

/** Marks a send as saved so the bubble can leave once the list reloads. */
export function confirmOutgoingMessage(
  outgoing: OutgoingChatMessage[],
  clientId: string,
  confirmedId: string,
): OutgoingChatMessage[] {
  return outgoing.map((item) => (item.clientId === clientId ? { ...item, confirmedId } : item))
}

/** Drops sends from another match, and sends the loaded list already contains. */
export function pruneOutgoingMessages(
  outgoing: OutgoingChatMessage[],
  serverMessages: MatchMessage[],
  matchId: string | undefined,
): OutgoingChatMessage[] {
  const serverIds = new Set(serverMessages.map((item) => item.id))
  return outgoing.filter(
    (item) => item.matchId === matchId && (!item.confirmedId || !serverIds.has(item.confirmedId)),
  )
}

/** Adds the saved message to the loaded list without duplicating it. */
export function appendMessageIfMissing(
  messages: MatchMessage[] | undefined,
  saved: MatchMessage,
): MatchMessage[] {
  const current = messages ?? []
  if (current.some((item) => item.id === saved.id)) return current
  return [...current, saved]
}

/** Puts a failed send back only when the player has not started a new one. */
export function restoreDraftOnSendFailure(currentDraft: string, failedMarkup: string): string {
  return currentDraft.trim() ? currentDraft : failedMarkup
}
