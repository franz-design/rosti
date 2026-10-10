import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

export function PlayerDetailHeader() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2"
      render={<Link to={readReturnPath(location.state)} />}
    >
      ← {t('playerDetail.back')}
    </Button>
  )
}

function readReturnPath(state: unknown): string {
  if (!state || typeof state !== 'object' || !('from' in state)) return '/dashboard'

  const from = state.from
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return '/dashboard'
  }

  return from
}
