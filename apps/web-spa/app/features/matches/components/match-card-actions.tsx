import { Button } from '@rosti/ui/components/primitives/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rosti/ui/components/primitives/dropdown-menu'
import { MoreVertical } from '@rosti/ui/icons'
import { useTranslation } from 'react-i18next'
import type { Match } from '@/lib/rosti-api'

interface MatchCardActionsProps {
  match: Match
  onPostpone: (match: Match) => void
  onCancel: (matchId: string) => void
}

export function MatchCardActions({ match, onPostpone, onCancel }: MatchCardActionsProps) {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t('matches.menuOpen')} />
        }
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            onPostpone(match)
          }}
        >
          {t('matches.postpone')}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => {
            e.preventDefault()
            onCancel(match.id)
          }}
        >
          {t('matches.cancel')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
