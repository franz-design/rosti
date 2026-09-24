import { useQuery } from '@tanstack/react-query'
import { useMemo, type RefObject } from 'react'
import { useClub } from '@/features/clubs/hooks/club-context'
import { authClient } from '@/lib/auth-client'
import { rostiApi, type MatchMessage } from '@/lib/rosti-api'
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
  const { activeClub } = useClub()
  const { data: session } = authClient.useSession()

  const { data: members = [] } = useQuery({
    queryKey: ['club-members', activeClub?.id, session?.user?.id],
    queryFn: () => rostiApi.listMembers(activeClub!.id),
    enabled: !!activeClub && !!session?.user,
  })

  const mentionCandidates = useMemo(
    () =>
      members
        .map((member) => ({ id: member.userId, display: member.name }))
        .sort((left, right) =>
          left.display.localeCompare(right.display, undefined, { sensitivity: 'base' }),
        ),
    [members],
  )

  const mentionNameById = useMemo(
    () =>
      Object.fromEntries(mentionCandidates.map((candidate) => [candidate.id, candidate.display])),
    [mentionCandidates],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatConversation
        messages={messages}
        currentUserId={currentUserId}
        endRef={endRef}
        mentionNameById={mentionNameById}
      />
      <ChatTextInput
        value={draft}
        onChange={onDraftChange}
        onSubmit={onSubmit}
        isPending={isPending}
        mentionCandidates={mentionCandidates}
      />
    </div>
  )
}
