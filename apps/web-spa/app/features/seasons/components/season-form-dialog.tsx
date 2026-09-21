import { Button } from '@rosti/ui/components/primitives/button'
import { DatePicker } from '@rosti/ui/components/primitives/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@rosti/ui/components/primitives/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@rosti/ui/components/primitives/form'
import { Input } from '@rosti/ui/components/primitives/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { createSeasonFormSchema } from '../utils/season-form'
import type { SeasonFormValues } from '../utils/season-dates'

interface SeasonFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues: SeasonFormValues
  dateLocale: string
  activeSeasonName?: string
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SeasonFormValues) => void
}

export function SeasonFormDialog({
  open,
  mode,
  initialValues,
  dateLocale,
  activeSeasonName,
  isPending,
  onOpenChange,
  onSubmit,
}: SeasonFormDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(
    () =>
      createSeasonFormSchema({
        nameRequired: t('seasons.form.nameRequired'),
        endBeforeStart: t('seasons.form.endBeforeStart'),
      }),
    [t],
  )
  const form = useForm<SeasonFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(initialValues)
  }, [form, initialValues, open])

  const description =
    mode === 'create' && activeSeasonName
      ? t('seasons.form.createClosesActive', { name: activeSeasonName })
      : mode === 'create'
        ? t('seasons.form.createDescription')
        : t('seasons.form.editDescription')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('seasons.form.createTitle') : t('seasons.form.editTitle')}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="seasonName">{t('seasons.form.name')}</FormLabel>
                  <FormControl>
                    <Input
                      id="seasonName"
                      {...field}
                      placeholder={t('seasons.form.namePlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startsAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('seasons.form.startsAt')}</FormLabel>
                  <DatePicker
                    value={field.value}
                    onDateChange={(date) => {
                      if (date) field.onChange(date)
                    }}
                    localeCode={dateLocale}
                    placeholder={t('seasons.form.datePlaceholder')}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endsAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('seasons.form.endsAt')}</FormLabel>
                  <DatePicker
                    value={field.value ?? undefined}
                    onDateChange={(date) => field.onChange(date ?? null)}
                    localeCode={dateLocale}
                    placeholder={t('seasons.form.datePlaceholder')}
                  />
                  <p className="text-sm text-muted-foreground">{t('seasons.form.endsAtHint')}</p>
                  {field.value ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => field.onChange(null)}
                    >
                      {t('seasons.form.clearEnd')}
                    </Button>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('seasons.form.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t('seasons.form.saving') : t('seasons.form.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
