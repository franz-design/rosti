import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { useClub } from '@/features/clubs/hooks/club-context'
import { rostiApi } from '@/lib/rosti-api'
import { CreateMatchForm } from './components/create-match/create-match-form'
import { CreateMatchHeader } from './components/create-match/create-match-header'
import {
  combineDateAndTime,
  defaultNextMatchDate,
  type RecurrenceChoice,
} from './utils/match-schedule-utils'

export default function CreateMatchPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { activeClub } = useClub()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [defaultsReady, setDefaultsReady] = useState(false)
  const [matchDate, setMatchDate] = useState<Date | undefined>(() => defaultNextMatchDate())
  const [matchTime, setMatchTime] = useState('19:00')
  const [recurrence, setRecurrence] = useState<RecurrenceChoice>('weekly')

  useEffect(() => {
    if (!activeClub || defaultsReady) return
    setTitle(t('createMatch.defaultTitle', { club: activeClub.name }))
    setLocation(activeClub.venue ?? '')
    setMaxPlayers(activeClub.defaultMaxCapacity ?? 10)
    setDefaultsReady(true)
  }, [activeClub, defaultsReady, t])

  const weekdayName = useMemo(
    () => (matchDate ? matchDate.toLocaleDateString('fr-FR', { weekday: 'long' }) : ''),
    [matchDate],
  )
  const dayOfMonth = matchDate?.getDate() ?? 1

  const create = useMutation({
    mutationFn: async () => {
      if (!activeClub) throw new Error(t('createMatch.errors.missingClub'))
      if (!matchDate || !title.trim()) throw new Error(t('createMatch.errors.requiredFields'))
      if (maxPlayers < 2) throw new Error(t('createMatch.errors.maxPlayers'))

      const seasons = await rostiApi.listSeasons(activeClub.id)
      let seasonId = seasons.find((s) => s.status === 'active')?.id
      if (!seasonId) {
        const year = new Date().getFullYear()
        const season = await rostiApi.createSeason(activeClub.id, {
          name: t('createMatch.seasonName', { year }),
          startsAt: new Date().toISOString().slice(0, 10),
        })
        seasonId = season.id
      }

      const startsAt = combineDateAndTime(matchDate, matchTime)
      await rostiApi.createMatches(activeClub.id, {
        seasonId,
        title: title.trim(),
        startsAt: startsAt.toISOString(),
        location: location.trim() || undefined,
        maxCapacity: maxPlayers,
        reminderOffsetsHours: [120, 48],
        recurrence:
          recurrence === 'once'
            ? undefined
            : {
                frequency: recurrence,
                occurrenceCount: 12,
              },
      })
    },
    onSuccess: () => {
      toast.success(t('createMatch.success'))
      void queryClient.invalidateQueries({ queryKey: ['matches', activeClub?.id] })
      navigate('/matches')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (!activeClub) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <CreateMatchHeader clubName={activeClub.name} />
      <CreateMatchForm
        values={{ title, location, maxPlayers, matchDate, matchTime, recurrence }}
        weekdayName={weekdayName}
        dayOfMonth={dayOfMonth}
        isPending={create.isPending}
        onTitleChange={setTitle}
        onLocationChange={setLocation}
        onMaxPlayersChange={setMaxPlayers}
        onDateChange={setMatchDate}
        onTimeChange={setMatchTime}
        onRecurrenceChange={setRecurrence}
        onSubmit={() => create.mutate()}
      />
    </div>
  )
}
