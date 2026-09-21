import { Button } from '@rosti/ui/components/primitives/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@rosti/ui/components/primitives/dialog'
import { XIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Attendance, Lineup, SportType } from '@/lib/rosti-api'
import { getCourtImage } from '@/features/matches/utils/court-by-sport'
import { sortUnassignedPlayersFirst } from '@/features/matches/utils/sort-available-players'
import { AvailablePlayersList } from './available-players-list'
import { LineupPitch } from './lineup-pitch'
import { TeamToggleButton } from './team-toggle-button'

type TeamSide = 'blue' | 'red'
type TeamDraft = Record<string, TeamSide>

interface LineupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  presentPlayers: Attendance[]
  lineups: Lineup[]
  sportType?: SportType | null
  isPending?: boolean
  onSave: (assignments: Array<{ userId: string; team: TeamSide }>) => void
}

export function LineupDialog({
  open,
  onOpenChange,
  presentPlayers,
  lineups,
  sportType,
  isPending,
  onSave,
}: LineupDialogProps) {
  const { t } = useTranslation()
  const [side, setSide] = useState<TeamSide>('blue')
  const [draft, setDraft] = useState<TeamDraft>({})
  const [initialSerialized, setInitialSerialized] = useState('')
  const lineupsRef = useRef(lineups)
  lineupsRef.current = lineups

  useEffect(() => {
    if (!open) return
    const next = draftFromLineups(lineupsRef.current)
    setDraft(next)
    setInitialSerialized(serializeDraft(next))
    setSide('blue')
  }, [open])

  const courtSrc = getCourtImage(sportType)
  const isDirty = serializeDraft(draft) !== initialSerialized
  const presentIds = useMemo(
    () => new Set(presentPlayers.map((player) => player.userId)),
    [presentPlayers],
  )

  const sidePlayers = useMemo(
    () => presentPlayers.filter((player) => draft[player.userId] === side),
    [draft, presentPlayers, side],
  )

  const availablePlayers = useMemo(() => {
    const notOnThisSide = presentPlayers.filter((player) => draft[player.userId] !== side)
    return sortUnassignedPlayersFirst(notOnThisSide, draft)
  }, [draft, presentPlayers, side])

  const otherSide: TeamSide = side === 'blue' ? 'red' : 'blue'

  function handleAssign(userId: string) {
    setDraft((prev) => ({ ...prev, [userId]: side }))
  }

  function handleRemove(userId: string) {
    setDraft((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }

  function handleSave() {
    const assignments = Object.entries(draft)
      .filter(([userId]) => presentIds.has(userId))
      .map(([userId, team]) => ({ userId, team }))
    onSave(assignments)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full flex-col gap-3 overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogClose render={<Button variant="ghost" size="icon-sm" />}>
              <XIcon />
              <span className="sr-only">{t('matches.detail.lineupEditor.close')}</span>
            </DialogClose>
            <DialogTitle className="flex-1 text-center">
              {t('matches.detail.lineupEditor.title')}
            </DialogTitle>
            <Button size="sm" onClick={handleSave} disabled={!isDirty || isPending}>
              {t('matches.detail.lineupEditor.save')}
            </Button>
          </div>
          <DialogDescription className="sr-only">
            {t('matches.detail.lineupEditor.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-muted p-1">
            <TeamToggleButton
              active={side === 'blue'}
              tone="blue"
              label={t('matches.detail.lineupEditor.teamBlue')}
              onClick={() => setSide('blue')}
            />
            <TeamToggleButton
              active={side === 'red'}
              tone="red"
              label={t('matches.detail.lineupEditor.teamRed')}
              onClick={() => setSide('red')}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:flex-row">
          <div className="min-w-0 flex-1">
            <LineupPitch
              courtSrc={courtSrc}
              team={side}
              players={sidePlayers}
              onRemove={handleRemove}
            />
          </div>
          <AvailablePlayersList
            players={availablePlayers}
            otherSide={otherSide}
            draft={draft}
            onAssign={handleAssign}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function draftFromLineups(lineups: Lineup[]): TeamDraft {
  const next: TeamDraft = {}
  for (const lineup of lineups) {
    next[lineup.userId] = lineup.team
  }
  return next
}

function serializeDraft(draft: TeamDraft): string {
  return Object.entries(draft)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([userId, team]) => `${userId}:${team}`)
    .join('|')
}
