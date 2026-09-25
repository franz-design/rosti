import { cn } from '@rosti/ui/lib/utils'
import { PlayerAvatar } from '@/common/components/player-avatar'
import type { MatchMessage } from '@/lib/rosti-api'
import { splitMentionedBody } from '@/features/matches/utils/chat-mentions'

interface ChatBubbleProps {
  message: MatchMessage
  isMine: boolean
  mentionNameById: Record<string, string>
}

export function ChatBubble({ message, isMine, mentionNameById }: ChatBubbleProps) {
  const mentionedNames = message.mentionedUserIds
    .map((id) => mentionNameById[id])
    .filter((name): name is string => Boolean(name))
  const parts = splitMentionedBody(message.body, mentionedNames)

  return (
    <div className={cn('flex flex-col gap-0.5', isMine ? 'items-end' : 'items-start')}>
      {!isMine ? (
        <span className="flex items-center gap-1.5 px-1">
          <PlayerAvatar name={message.authorName} imageUrl={message.authorImage} size="sm" />
          <span className="text-xs font-medium text-muted-foreground">{message.authorName}</span>
        </span>
      ) : null}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
          isMine ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {parts.map((part, index) =>
          part.type === 'mention' ? (
            <strong key={`${part.value}-${index}`} className="font-bold">
              {part.value}
            </strong>
          ) : (
            <span key={`${part.value}-${index}`}>{part.value}</span>
          ),
        )}
      </div>
    </div>
  )
}
