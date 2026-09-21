import { Button } from '@rosti/ui/components/primitives/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface HomeActionsProps {
  isClubAdmin: boolean
}

export function HomeActions({ isClubAdmin }: HomeActionsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" render={<Link to="/matches" />}>
        {t('home.allMatches')}
      </Button>
      <Button variant="outline" render={<Link to="/seasons" />}>
        {t('seasons.title')}
      </Button>
      {isClubAdmin ? (
        <Button variant="outline" render={<Link to="/club-settings" />}>
          {t('nav.clubSettings')}
        </Button>
      ) : null}
    </div>
  )
}
