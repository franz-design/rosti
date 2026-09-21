import { useTranslation } from 'react-i18next'
import type { RefObject } from 'react'
import type { MatchMessage } from '@/lib/rosti-api'
import { ChatBubble } from './chat-bubble'

interface ChatConversationProps {
  messages: MatchMessage[]
  currentUserId?: string
  endRef: RefObject<HTMLDivElement | null>
}

export function ChatConversation({ messages, currentUserId, endRef }: ChatConversationProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('matches.detail.chat.empty')}</p>
      ) : (
        messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isMine={msg.authorId === currentUserId} />
        ))
      )}
      <div ref={endRef} />
    </div>
  )
}
