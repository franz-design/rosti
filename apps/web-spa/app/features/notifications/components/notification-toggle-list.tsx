import { useTranslation } from 'react-i18next'
import type { NotificationPreference } from '@/lib/rosti-api'
import { NotificationToggle } from './notification-toggle'

const TOGGLE_KEYS = [
  'emailEnabled',
  'pushEnabled',
  'notifyNewMatch',
  'notifyRsvpReminder',
  'notifyMatchCancelled',
  'notifyChatMention',
  'notifyAllChatMessages',
] as const satisfies ReadonlyArray<keyof NotificationPreference>

interface NotificationToggleListProps {
  prefs: NotificationPreference
  onToggle: (key: keyof NotificationPreference, nextValue: boolean) => void
}

export function NotificationToggleList({ prefs, onToggle }: NotificationToggleListProps) {
  const { t } = useTranslation()

  return (
    <ul className="space-y-3">
      {TOGGLE_KEYS.map((key) => {
        const value = prefs[key]
        if (typeof value !== 'boolean') return null
        return (
          <NotificationToggle
            key={key}
            label={t(`profile.notifications.${key}`)}
            value={value}
            onToggle={() => onToggle(key, !value)}
          />
        )
      })}
    </ul>
  )
}
