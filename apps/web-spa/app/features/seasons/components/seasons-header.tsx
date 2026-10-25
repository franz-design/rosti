import { Button } from '@rosti/ui/components/primitives/button'
import { Plus } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { resolveSeasonsBackTarget } from '../utils/seasons-back'

interface SeasonsHeaderProps {
  clubName: string
  canManage: boolean
  onCreate: () => void
}

export function SeasonsHeader({ clubName, canManage, onCreate }: SeasonsHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function handleBack() {
    const target = resolveSeasonsBackTarget(window.history.state?.idx)
    if (target === -1) {
      navigate(-1)
      return
    }
    navigate(target)
  }

  return (
    <div className="space-y-2">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={handleBack}>
        ← {t('seasons.back')}
      </Button>
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
    </div>
  )
}
