import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@rosti/ui/components/primitives/button'
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
import { Label } from '@rosti/ui/components/primitives/label'
import { RadioGroup, RadioGroupItem } from '@rosti/ui/components/primitives/radio-group'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  createRenameMatchFormSchema,
  type RenameMatchFormValues,
} from '@/features/matches/utils/rename-match-form'

interface RenameMatchDialogProps {
  open: boolean
  currentTitle: string
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: RenameMatchFormValues) => void
}

export function RenameMatchDialog({
  open,
  currentTitle,
  isPending,
  onOpenChange,
  onSubmit,
}: RenameMatchDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(
    () => createRenameMatchFormSchema({ titleRequired: t('matches.renameNameRequired') }),
    [t],
  )
  const form = useForm<RenameMatchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: currentTitle, scope: 'match' },
  })

  useEffect(() => {
    if (!open) return
    form.reset({ title: currentTitle, scope: 'match' })
  }, [currentTitle, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('matches.renameTitle')}</DialogTitle>
          <DialogDescription>{t('matches.renameDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="matchRenameTitle">{t('matches.renameName')}</FormLabel>
                  <FormControl>
                    <Input id="matchRenameTitle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('matches.renameScope')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="gap-3"
                    >
                      <Label className="items-start gap-3 font-normal">
                        <RadioGroupItem value="match" />
                        <span className="font-medium">{t('matches.renameScopeMatch')}</span>
                      </Label>
                      <Label className="items-start gap-3 font-normal">
                        <RadioGroupItem value="following" />
                        <span className="space-y-1">
                          <span className="block font-medium">
                            {t('matches.renameScopeFollowing')}
                          </span>
                          <span className="block text-sm font-normal text-muted-foreground">
                            {t('matches.renameScopeFollowingHint')}
                          </span>
                        </span>
                      </Label>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t('matches.postponeCancel')}
              </Button>
              <Button type="submit" loading={isPending} disabled={isPending}>
                {t('matches.renameConfirm')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
