import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import type { RefObject } from 'react'
import { EmptyMatchArt } from '@/features/matches/components/empty-match-art'
import type { MatchMessage } from '@/lib/rosti-api'
import { ChatBubble } from './chat-bubble'

interface ChatConversationProps {
  messages: MatchMessage[]
  currentUserId?: string
  scrollRef: RefObject<HTMLDivElement | null>
  mentionNameById: Record<string, string>
}

export function ChatConversation({
  messages,
  currentUserId,
  scrollRef,
  mentionNameById,
}: ChatConversationProps) {
  const { t } = useTranslation()

  const isEmpty = messages.length === 0

  return (
    <div
      ref={scrollRef}
      className={cn(
        'min-h-0 flex-1 overscroll-contain px-6 py-4',
        isEmpty
          ? 'flex flex-col items-center justify-center overflow-hidden text-center'
          : 'space-y-3 overflow-y-auto',
      )}
    >
      {isEmpty ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-2">
          <EmptyMatchArt name="whistle" className="w-full" />
          <p className="text-sm text-muted-foreground">{t('matches.detail.chat.empty')}</p>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isMine={msg.authorId === currentUserId}
            mentionNameById={mentionNameById}
          />
        ))
      )}
    </div>
  )
}
