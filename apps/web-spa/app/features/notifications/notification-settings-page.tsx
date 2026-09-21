import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rostiApi, type NotificationPreference } from '@/lib/rosti-api'
import { NotificationToggleList } from './components/notification-toggle-list'

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient()
  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => rostiApi.getNotificationPreferences(),
  })

  const update = useMutation({
    mutationFn: (body: Partial<NotificationPreference>) =>
      rostiApi.updateNotificationPreferences(body),
    onSuccess: () => {
      toast.success('Preferences saved')
      void queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
  })

  if (isLoading || !prefs) return <div className="p-6">Loading…</div>

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black">Notifications</h1>
        <p className="text-muted-foreground">Choisis comment Rösti te contacte.</p>
      </div>
      <NotificationToggleList
        prefs={prefs}
        onToggle={(key, nextValue) => update.mutate({ [key]: nextValue })}
      />
    </div>
  )
}
