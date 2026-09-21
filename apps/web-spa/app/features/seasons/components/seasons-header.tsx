import { Button } from '@rosti/ui/components/primitives/button'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SeasonsHeaderProps {
  clubName: string
  canManage: boolean
  onCreate: () => void
}

export function SeasonsHeader({ clubName, canManage, onCreate }: SeasonsHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight">{t('seasons.title')}</h1>
        <p className="text-sm text-muted-foreground">{clubName}</p>
        <p className="max-w-xl text-sm text-muted-foreground">{t('seasons.description')}</p>
      </div>
      {canManage ? (
        <Button onClick={onCreate}>
          <Plus className="size-4" />
          {t('seasons.create')}
        </Button>
      ) : null}
    </div>
  )
}
