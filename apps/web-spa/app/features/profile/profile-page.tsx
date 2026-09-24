import { toast } from '@rosti/ui/components/primitives/sonner'
import { Tabs, TabsContent } from '@rosti/ui/components/primitives/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useTabSearchParam } from '@/common/hooks/use-tab-search-param'
import { NotificationPreferencesSection } from '@/features/notifications/components/notification-preferences-section'
import { authClient } from '@/lib/auth-client'
import { ProfileDetailsForm } from './components/profile-details-form'
import { ProfileHeader } from './components/profile-header'
import { ProfileIdentity } from './components/profile-identity'
import { DEFAULT_PROFILE_TAB, PROFILE_TABS, ProfileTabsList } from './components/profile-tabs'
import {
  getNameParts,
  getProfileDisplayName,
  getProfileInitials,
  type ProfileNameParts,
  type ProfileUser,
} from './utils/get-name-parts'

const profileDetailsSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export default function ProfilePage() {
  const { t } = useTranslation()
  const [profileTab, setProfileTab] = useTabSearchParam(PROFILE_TABS, DEFAULT_PROFILE_TAB)
  const { data: sessionData, refetch } = authClient.useSession()
  const user = sessionData?.user as ProfileUser | undefined

  const firstName = user?.firstName
  const lastName = user?.lastName
  const fullName = user?.name

  const form = useForm<ProfileNameParts>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: getNameParts(user),
  })

  useEffect(() => {
    if (form.formState.isDirty) return
    form.reset(getNameParts({ firstName, lastName, name: fullName }))
  }, [form, firstName, lastName, fullName])

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileNameParts) => {
      const name = `${data.firstName} ${data.lastName}`.trim()
      const response = await authClient.updateUser({
        name,
        // @ts-expect-error additional fields inferred at runtime
        firstName: data.firstName,
        lastName: data.lastName,
      })

      if (response.error) {
        throw new Error(response.error.message ?? t('profile.saveError'))
      }

      return response.data
    },
    onSuccess: async (_result, data) => {
      form.reset(data)
      await refetch()
      toast.success(t('profile.saved'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('profile.saveError'))
    },
  })

  const displayName = getProfileDisplayName(user, t('common.user'))
  const initials = getProfileInitials(displayName)

  return (
    <div className="space-y-8">
      <ProfileHeader />

      <Tabs value={profileTab} onValueChange={setProfileTab} className="gap-4">
        <ProfileTabsList />

        <TabsContent value="info" className="outline-none">
          <div className="space-y-8">
            <ProfileIdentity displayName={displayName} initials={initials} email={user?.email} />
            <ProfileDetailsForm
              form={form}
              email={user?.email}
              isPending={isPending}
              onSubmit={(data) => saveProfile(data)}
            />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="outline-none">
          <NotificationPreferencesSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
