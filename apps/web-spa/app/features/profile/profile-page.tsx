import { toast } from '@rosti/ui/components/primitives/sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { ProfileDetailsForm } from './components/profile-details-form'
import { ProfileHeader } from './components/profile-header'
import { ProfileIdentity } from './components/profile-identity'
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
  const { data: sessionData, refetch } = authClient.useSession()
  const user = sessionData?.user as ProfileUser | undefined

  const form = useForm<ProfileNameParts>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: getNameParts(user),
  })

  useEffect(() => {
    if (form.formState.isDirty) return
    form.reset(getNameParts(user))
  }, [form, user?.firstName, user?.lastName, user?.name])

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
      <ProfileIdentity displayName={displayName} initials={initials} email={user?.email} />
      <ProfileDetailsForm
        form={form}
        email={user?.email}
        isPending={isPending}
        onSubmit={(data) => saveProfile(data)}
      />
    </div>
  )
}
