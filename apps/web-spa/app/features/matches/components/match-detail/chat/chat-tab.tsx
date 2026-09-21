import type { RefObject } from 'react'
import type { MatchMessage } from '@/lib/rosti-api'
import { ChatConversation } from './chat-conversation'
import { ChatTextInput } from './chat-text-input'

interface ChatTabProps {
  messages: MatchMessage[]
  currentUserId?: string
  endRef: RefObject<HTMLDivElement | null>
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: () => void
  isPending: boolean
}

export function ChatTab({
  messages,
  currentUserId,
  endRef,
  draft,
  onDraftChange,
  onSubmit,
  isPending,
}: ChatTabProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatConversation messages={messages} currentUserId={currentUserId} endRef={endRef} />
      <ChatTextInput
        value={draft}
        onChange={onDraftChange}
        onSubmit={onSubmit}
        isPending={isPending}
      />
    </div>
  )
}
