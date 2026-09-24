import { Button } from '@rosti/ui/components/primitives/button'
import { cn } from '@rosti/ui/lib/utils'
import { Send } from '@rosti/ui/icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Mention, MentionsInput, type MentionsInputStyle } from 'react-mentions'
import './chat-text-input.css'

export interface ChatMentionCandidate {
  id: string
  display: string
}

interface ChatTextInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isPending: boolean
  mentionCandidates: ChatMentionCandidate[]
}

const mentionsInputStyle: MentionsInputStyle = {
  control: {
    fontSize: 'inherit',
    fontFamily: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    lineHeight: 'inherit',
  },
  highlighter: {
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    lineHeight: 'inherit',
  },
  input: {
    margin: 0,
    outline: 'none',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    lineHeight: 'inherit',
  },
  '&singleLine': {
    display: 'block',
    width: '100%',
    control: {
      display: 'block',
      width: '100%',
    },
    highlighter: {
      padding: '0.5rem 0.75rem',
      border: '1px solid transparent',
      borderRadius: 'var(--radius)',
    },
    input: {
      padding: '0.5rem 0.75rem',
      border: '1px solid transparent',
      borderRadius: 'var(--radius)',
    },
  },
  suggestions: {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    border: '1px solid color-mix(in oklab, var(--foreground) 10%, transparent)',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 24px color-mix(in oklab, var(--foreground) 12%, transparent)',
    overflow: 'hidden',
    list: {
      backgroundColor: 'transparent',
      maxHeight: '12rem',
      overflowY: 'auto',
      fontSize: '0.875rem',
      padding: '0.25rem',
      margin: 0,
    },
    item: {
      padding: '0.5rem 0.625rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      '&focused': {
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-foreground)',
      },
    },
  },
}

const mentionStyle = {
  backgroundColor: 'color-mix(in oklab, var(--primary) 18%, transparent)',
  borderRadius: '0.25rem',
}

export function ChatTextInput({
  value,
  onChange,
  onSubmit,
  isPending,
  mentionCandidates,
}: ChatTextInputProps) {
  const { t } = useTranslation()
  const canSubmit = Boolean(value.trim()) && !isPending

  const mentionData = useMemo(
    () =>
      mentionCandidates.map((candidate) => ({
        id: candidate.id,
        display: candidate.display,
      })),
    [mentionCandidates],
  )

  return (
    <form
      className="flex shrink-0 items-end gap-2 border-t bg-background p-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit) return
        onSubmit()
      }}
    >
      <div
        className={cn(
          'min-h-11 min-w-0 flex-1 rounded-lg border border-input bg-transparent transition-colors',
          // 16px keeps iOS Safari from zooming the page when the field takes focus
          'text-base',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          'dark:bg-input/30',
        )}
      >
        <MentionsInput
          singleLine
          value={value}
          onChange={(_event, newValue) => onChange(newValue)}
          placeholder={t('matches.detail.chat.placeholder')}
          className="chat-mentions"
          style={mentionsInputStyle}
          allowSuggestionsAboveCursor
          forceSuggestionsAboveCursor
          a11ySuggestionsListLabel={t('matches.detail.chat.mentionSuggestions')}
          autoComplete="off"
        >
          <Mention
            trigger="@"
            markup="@[__display__](__id__)"
            data={mentionData}
            displayTransform={(_id, display) => `@${display}`}
            style={mentionStyle}
            appendSpaceOnAdd
            renderSuggestion={(_entry, _search, highlightedDisplay, _index, focused) => (
              <div className={cn('truncate', focused && 'font-medium')}>{highlightedDisplay}</div>
            )}
          />
        </MentionsInput>
      </div>
      <Button type="submit" disabled={!canSubmit} size="icon" className="size-11 shrink-0">
        <Send className="size-4" />
        <span className="sr-only">{t('matches.detail.chat.send')}</span>
      </Button>
    </form>
  )
}
