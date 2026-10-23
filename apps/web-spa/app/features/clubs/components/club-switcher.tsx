import { Button } from '@rosti/ui/components/primitives/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rosti/ui/components/primitives/dropdown-menu'
import { SidebarMenuButton, SidebarMenuItem } from '@rosti/ui/components/primitives/sidebar'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { CheckIcon, ChevronDown } from '@rosti/ui/icons'
import { SquareTransferHorizontalIcon } from '@solar-icons/react/bold/square-transfer-horizontal'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useClub } from '../hooks/club-context'

interface ClubSwitcherProps {
  variant?: 'sidebar' | 'header'
}

export function ClubSwitcher({ variant = 'sidebar' }: ClubSwitcherProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { clubs, activeClub, setActiveClubId } = useClub()
  const sortedClubs = useMemo(
    () => [...clubs].sort((left, right) => left.name.localeCompare(right.name)),
    [clubs],
  )

  if (clubs.length < 2 || !activeClub) return null

  const switcherLabel = `${t('clubSwitcher.label')}, ${activeClub.name}`

  const switchTo = async (clubId: string) => {
    if (clubId === activeClub.id) {
      navigate('/dashboard')
      return
    }
    try {
      await setActiveClubId(clubId)
      navigate('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      toast.error(message || t('clubSwitcher.error'))
    }
  }

  const menu = (
    <DropdownMenu>
      {variant === 'header' ? (
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-8 min-w-0 max-w-40 px-2"
              aria-label={switcherLabel}
            />
          }
        >
          <span className="truncate">{activeClub.name}</span>
          <ChevronDown className="size-4 shrink-0" />
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              tooltip={activeClub.name}
              aria-label={switcherLabel}
              className="cursor-pointer"
            />
          }
        >
          <SquareTransferHorizontalIcon className="size-20 shrink-0" />
          <span className="truncate">{activeClub.name}</span>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent
        side={variant === 'header' ? 'bottom' : 'right'}
        align="end"
        className="w-64"
      >
        {sortedClubs.map((club) => (
          <DropdownMenuItem key={club.id} onClick={() => void switchTo(club.id)}>
            <span className="truncate">{club.name}</span>
            {club.id === activeClub.id ? <CheckIcon className="ml-auto size-4 shrink-0" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (variant === 'header') return menu

  return <SidebarMenuItem>{menu}</SidebarMenuItem>
}
