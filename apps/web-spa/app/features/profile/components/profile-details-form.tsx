import { Button } from '@rosti/ui/components/primitives/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@rosti/ui/components/primitives/form'
import { Input } from '@rosti/ui/components/primitives/input'
import { useTranslation } from 'react-i18next'
import type { UseFormReturn } from 'react-hook-form'
import type { ProfileNameParts } from '../utils/get-name-parts'

interface ProfileDetailsFormProps {
  form: UseFormReturn<ProfileNameParts>
  email?: string | null
  isPending: boolean
  onSubmit: (data: ProfileNameParts) => void
}

export function ProfileDetailsForm({ form, email, isPending, onSubmit }: ProfileDetailsFormProps) {
  const { t } = useTranslation()

  return (
    <Form {...form}>
      <form className="max-w-xl space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="firstName">{t('profile.firstName')}</FormLabel>
                <FormControl>
                  <Input id="firstName" {...field} autoComplete="given-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="lastName">{t('profile.lastName')}</FormLabel>
                <FormControl>
                  <Input id="lastName" {...field} autoComplete="family-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <label
            htmlFor="profile-email"
            className="text-sm leading-none font-medium text-foreground"
          >
            {t('profile.email')}
          </label>
          <Input
            id="profile-email"
            value={email ?? ''}
            type="email"
            autoComplete="email"
            disabled
            readOnly
          />
        </div>
        <Button type="submit" disabled={isPending || !form.formState.isDirty} loading={isPending}>
          {t('profile.save')}
        </Button>
      </form>
    </Form>
  )
}
