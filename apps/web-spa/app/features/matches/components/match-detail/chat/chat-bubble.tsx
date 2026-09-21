import { cn } from '@rosti/ui/lib/utils'
import type { MatchMessage } from '@/lib/rosti-api'

interface ChatBubbleProps {
  message: MatchMessage
  isMine: boolean
}

export function ChatBubble({ message, isMine }: ChatBubbleProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', isMine ? 'items-end' : 'items-start')}>
      {!isMine ? (
        <span className="px-1 text-xs font-medium text-muted-foreground">{message.authorName}</span>
      ) : null}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
          isMine ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {message.body}
      </div>
    </div>
  )
}
