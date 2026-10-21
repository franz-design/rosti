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
import { PasswordInput } from '@/common/components/password-input'
import { authPath } from '@/features/auth/utils/auth-continue-path'
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type AuthLoginFormData = z.infer<typeof loginSchema>

interface AuthLoginFormProps {
  onSubmit: (data: AuthLoginFormData) => void
  isPending: boolean
}

export const AuthLoginForm: React.FC<AuthLoginFormProps> = ({ onSubmit, isPending }) => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const form = useForm<AuthLoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <Form {...form}>
      <form className="mt-8 flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">{t('auth.login.email')}</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  {...field}
                  type="email"
                  autoComplete="email"
                  className="h-10 px-3 py-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel htmlFor="password">{t('auth.login.password')}</FormLabel>
                <Link
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  to={authPath('/forgot-password', searchParams)}
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  id="password"
                  {...field}
                  autoComplete="current-password"
                  className="h-10 py-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="mt-2 h-10 w-full py-0"
          type="submit"
          disabled={isPending}
          loading={isPending}
        >
          {t('auth.login.signIn')}
        </Button>
      </form>
    </Form>
  )
}
