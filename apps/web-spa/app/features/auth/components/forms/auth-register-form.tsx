import { Button } from '@rosti/ui/components/primitives/button'
import { Lock } from '@rosti/ui/icons'
import { cn } from '@rosti/ui/lib/utils'
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
import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm, type ControllerRenderProps } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const baseRegisterSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  password: z.string().min(6),
  confirmPassword: z.string(),
})

function getRegisterSchema(t: (key: string) => string) {
  return baseRegisterSchema.refine((data) => data.password === data.confirmPassword, {
    message: t('errorCodes.PASSWORDS_DO_NOT_MATCH'),
    path: ['confirmPassword'],
  })
}

export type AuthRegisterFormData = z.infer<typeof baseRegisterSchema>

const authFieldClass = 'h-10 px-3 py-0'

interface AuthRegisterFormProps {
  onSubmit: (data: AuthRegisterFormData) => void
  isPending: boolean
  defaultEmail?: string
  emailReadOnly?: boolean
  submitLabel?: string
}

export const AuthRegisterForm: React.FC<AuthRegisterFormProps> = ({
  onSubmit,
  isPending,
  defaultEmail,
  emailReadOnly = false,
  submitLabel,
}) => {
  const { t } = useTranslation()
  const registerSchema = getRegisterSchema(t)
  const form = useForm<AuthRegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: defaultEmail ?? '',
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <Form {...form}>
      <form className="mt-6 flex flex-col gap-3.5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormMessage />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="firstName">{t('auth.register.firstName')}</FormLabel>
                <FormControl>
                  <Input
                    id="firstName"
                    {...field}
                    autoComplete="given-name"
                    className={authFieldClass}
                  />
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
                <FormLabel htmlFor="lastName">{t('auth.register.lastName')}</FormLabel>
                <FormControl>
                  <Input
                    id="lastName"
                    {...field}
                    autoComplete="family-name"
                    className={authFieldClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phone">{t('auth.register.phone')}</FormLabel>
              <FormControl>
                <Input
                  id="phone"
                  {...field}
                  type="tel"
                  autoComplete="tel"
                  className={authFieldClass}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">{t('auth.register.email')}</FormLabel>
              <FormControl>
                <RegisterEmailInput field={field} emailReadOnly={emailReadOnly} />
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
              <FormLabel htmlFor="password">{t('auth.register.password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  id="password"
                  {...field}
                  autoComplete="new-password"
                  className="h-10 py-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</FormLabel>
              <FormControl>
                <PasswordInput
                  id="confirmPassword"
                  {...field}
                  autoComplete="new-password"
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
          {submitLabel ?? t('auth.register.signUp')}
        </Button>
      </form>
    </Form>
  )
}

function RegisterEmailInput({
  field,
  emailReadOnly,
}: {
  field: ControllerRenderProps<AuthRegisterFormData, 'email'>
  emailReadOnly: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="relative">
      <Input
        id="email"
        {...field}
        type="email"
        autoComplete="email"
        readOnly={emailReadOnly}
        aria-readonly={emailReadOnly || undefined}
        aria-describedby={emailReadOnly ? 'register-email-locked' : undefined}
        className={cn(
          authFieldClass,
          emailReadOnly && 'cursor-default border-transparent bg-[#f7f3ef] pr-9 text-foreground/80',
        )}
      />
      {emailReadOnly ? (
        <>
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <p id="register-email-locked" className="sr-only">
            {t('auth.register.emailLocked')}
          </p>
        </>
      ) : null}
    </div>
  )
}
