import { cn } from '@rosti/ui/lib/utils'
import { useTranslation } from 'react-i18next'
import type { RefObject } from 'react'
import { useScrollEdgeGuard } from '@/common/hooks/use-scroll-edge-guard'
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
  useScrollEdgeGuard(scrollRef)

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-none px-6 py-4">
      <div
        className={cn(
          'flex flex-col',
          isEmpty ? 'min-h-full items-center justify-center text-center' : 'space-y-3',
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
    </div>
  )
}
