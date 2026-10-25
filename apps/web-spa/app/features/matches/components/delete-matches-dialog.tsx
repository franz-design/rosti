import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@rosti/ui/components/primitives/alert-dialog'
import { useTranslation } from 'react-i18next'

interface DeleteMatchesDialogProps {
  open: boolean
  scope: 'match' | 'all'
  matchTitle?: string
  count: number
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteMatchesDialog({
  open,
  scope,
  matchTitle,
  count,
  isPending,
  onOpenChange,
  onConfirm,
}: DeleteMatchesDialogProps) {
  const { t } = useTranslation()
  const title = scope === 'match' ? t('matches.deleteTitle') : t('matches.deleteAllTitle')
  const description =
    scope === 'match'
      ? t('matches.deleteDescription', { title: matchTitle ?? '' })
      : count <= 1
        ? t('matches.deleteAllDescriptionOne')
        : t('matches.deleteAllDescription', { count })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isPending) return
        onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('matches.deleteDismiss')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={onConfirm}>
            {t('matches.deleteConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
