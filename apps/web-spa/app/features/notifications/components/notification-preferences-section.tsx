import { AppLoader } from '@rosti/ui/components/app'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { rostiApi, type NotificationPreference } from '@/lib/rosti-api'
import { NotificationToggleList } from './notification-toggle-list'

export function NotificationPreferencesSection() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => rostiApi.getNotificationPreferences(),
  })

  const update = useMutation({
    mutationFn: (body: Partial<NotificationPreference>) =>
      rostiApi.updateNotificationPreferences(body),
    onSuccess: () => {
      toast.success(t('profile.notifications.saved'))
      void queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
  })

  if (isLoading || !prefs) return <AppLoader />

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-muted-foreground">{t('profile.notifications.description')}</p>
      <NotificationToggleList
        prefs={prefs}
        onToggle={(key, nextValue) => update.mutate({ [key]: nextValue })}
      />
    </div>
  )
}
