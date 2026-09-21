import type { NotificationPreference } from '@/lib/rosti-api'
import { NotificationToggle } from './notification-toggle'

const TOGGLES: Array<{ key: keyof NotificationPreference; label: string }> = [
  { key: 'emailEnabled', label: 'Email notifications' },
  { key: 'pushEnabled', label: 'Push notifications' },
  { key: 'notifyNewMatch', label: 'New match' },
  { key: 'notifyRsvpReminder', label: 'RSVP reminders' },
  { key: 'notifyMatchCancelled', label: 'Match cancelled' },
  { key: 'notifyChatMention', label: 'Chat mentions' },
  { key: 'chatMentionsOnly', label: 'Chat: mentions only (ignore other messages)' },
  { key: 'notifyAllChatMessages', label: 'All chat messages' },
]

interface NotificationToggleListProps {
  prefs: NotificationPreference
  onToggle: (key: keyof NotificationPreference, nextValue: boolean) => void
}

export function NotificationToggleList({ prefs, onToggle }: NotificationToggleListProps) {
  return (
    <ul className="space-y-3">
      {TOGGLES.map(({ key, label }) => {
        if (key === 'id') return null
        const value = prefs[key]
        if (typeof value !== 'boolean') return null
        return (
          <NotificationToggle
            key={key}
            label={label}
            value={value}
            onToggle={() => onToggle(key, !value)}
          />
        )
      })}
    </ul>
  )
}
