import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { StepProgress } from '@/common/components/step-progress'
import { useClub } from '@/features/clubs/hooks/club-context'
import {
  endOfCalendarDay,
  isMatchDateOutsideSeason,
  parseCalendarDate,
} from '@/features/seasons/utils/season-dates'
import { fetchSeasonsQueryOptions } from '@/features/seasons/utils/seasons-queries'
import { rostiApi } from '@/lib/rosti-api'
import { CreateMatchForm } from './components/create-match/create-match-form'
import { CreateMatchHeader } from './components/create-match/create-match-header'
import { centsToEuroInput, eurosToCents } from './utils/euros'
import {
  createMatchStepIds,
  isCreateMatchStepReachable,
  type CreateMatchStepInput,
} from './utils/create-match-steps'
import {
  buildMatchRecurrencePayload,
  combineDateAndTime,
  DEFAULT_OCCURRENCE_COUNT,
  defaultNextMatchDate,
  MAX_OCCURRENCE_COUNT,
  type RecurrenceChoice,
  type RecurrenceEndMode,
} from './utils/match-schedule-utils'

export default function CreateMatchPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { activeClub } = useClub()

  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [pitchCost, setPitchCost] = useState('')
  const [defaultsReady, setDefaultsReady] = useState(false)
  const [matchDate, setMatchDate] = useState<Date | undefined>(() => defaultNextMatchDate())
  const [matchTime, setMatchTime] = useState('19:00')
  const [recurrence, setRecurrence] = useState<RecurrenceChoice>('weekly')
  const [endMode, setEndMode] = useState<RecurrenceEndMode>('count')
  const [occurrenceCount, setOccurrenceCount] = useState(DEFAULT_OCCURRENCE_COUNT)

  const { data: seasons = [] } = useQuery({
    ...fetchSeasonsQueryOptions(activeClub?.id ?? ''),
    enabled: !!activeClub,
  })
  const activeSeason = seasons.find((season) => season.status === 'active')
  const seasonStartsAt = activeSeason ? parseCalendarDate(activeSeason.startsAt) : null
  const seasonEndsAt = activeSeason?.endsAt ? parseCalendarDate(activeSeason.endsAt) : null
  const canUntilSeason = !!seasonEndsAt
  const stepIds = createMatchStepIds(recurrence)
  const stepCount = stepIds.length

  const stepInput: CreateMatchStepInput = {
    title,
    matchDate,
    maxPlayers,
    pitchCost,
    recurrence,
  }

  useEffect(() => {
    if (!canUntilSeason && endMode === 'season') {
      setEndMode('count')
    }
  }, [canUntilSeason, endMode])

  useEffect(() => {
    if (step > stepCount) setStep(stepCount)
  }, [step, stepCount])

  useEffect(() => {
    if (!activeClub || defaultsReady) return
    setTitle(t('createMatch.defaultTitle', { club: activeClub.name }))
    setLocation(activeClub.venue ?? '')
    setMaxPlayers(activeClub.defaultMaxCapacity ?? 10)
    if (activeClub.defaultPitchCostCents > 0) {
      setPitchCost(centsToEuroInput(activeClub.defaultPitchCostCents))
    }
    setDefaultsReady(true)
  }, [activeClub, defaultsReady, t])

  const weekdayName = useMemo(
    () => (matchDate ? matchDate.toLocaleDateString('fr-FR', { weekday: 'long' }) : ''),
    [matchDate],
  )
  const dayOfMonth = matchDate?.getDate() ?? 1

  const goToStep = (target: number) => {
    if (target === step) return
    if (target < step) {
      setStep(target)
      return
    }
    if (!isCreateMatchStepReachable(stepInput, target)) {
      if (!title.trim()) {
        setStep(1)
        toast.error(t('createMatch.errors.requiredFields'))
        return
      }
      if (!matchDate) {
        setStep(2)
        toast.error(t('createMatch.errors.requiredFields'))
        return
      }
      if (maxPlayers < 2) {
        setStep(3)
        toast.error(t('createMatch.errors.maxPlayers'))
        return
      }
      if (eurosToCents(pitchCost) == null) {
        setStep(3)
        toast.error(t('createMatch.errors.pitchCost'))
        return
      }
      return
    }
    setStep(target)
  }

  const create = useMutation({
    mutationFn: async () => {
      if (!activeClub) throw new Error(t('createMatch.errors.missingClub'))
      if (!matchDate || !title.trim()) throw new Error(t('createMatch.errors.requiredFields'))
      if (maxPlayers < 2) throw new Error(t('createMatch.errors.maxPlayers'))
      const pitchCostCents = eurosToCents(pitchCost)
      if (pitchCostCents == null) throw new Error(t('createMatch.errors.pitchCost'))
      if (
        recurrence !== 'once' &&
        endMode === 'count' &&
        (occurrenceCount < 1 || occurrenceCount > MAX_OCCURRENCE_COUNT)
      ) {
        throw new Error(t('createMatch.errors.requiredFields'))
      }

      let seasonId = activeSeason?.id
      if (!seasonId) {
        const year = new Date().getFullYear()
        const season = await rostiApi.createSeason(activeClub.id, {
          name: t('createMatch.seasonName', { year }),
          startsAt: new Date().toISOString().slice(0, 10),
        })
        seasonId = season.id
      }

      if (
        recurrence !== 'once' &&
        endMode === 'season' &&
        seasonStartsAt &&
        seasonEndsAt &&
        isMatchDateOutsideSeason(matchDate, seasonStartsAt, seasonEndsAt)
      ) {
        throw new Error(t('createMatch.errors.matchOutsideSeason'))
      }

      const startsAt = combineDateAndTime(matchDate, matchTime)
      await rostiApi.createMatches(activeClub.id, {
        seasonId,
        title: title.trim(),
        startsAt: startsAt.toISOString(),
        location: location.trim() || undefined,
        maxCapacity: maxPlayers,
        pitchCostCents,
        recurrence: buildMatchRecurrencePayload({
          recurrence,
          endMode,
          occurrenceCount,
          seasonEndsAtIso: seasonEndsAt ? endOfCalendarDay(seasonEndsAt).toISOString() : undefined,
        }),
      })
    },
    onSuccess: () => {
      toast.success(t('createMatch.success'))
      void queryClient.invalidateQueries({ queryKey: ['matches', activeClub?.id] })
      void queryClient.invalidateQueries({ queryKey: ['seasons', activeClub?.id] })
      navigate('/matches')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleNext = () => {
    if (step < stepCount) {
      goToStep(step + 1)
      return
    }
    create.mutate()
  }

  if (!activeClub) {
    return <Navigate to="/dashboard" replace />
  }

  const isStepEnabled = (target: number) =>
    target <= step || isCreateMatchStepReachable(stepInput, target)

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <CreateMatchHeader clubName={activeClub.name} />
      <StepProgress
        steps={stepIds}
        step={step}
        ariaLabel={t('createMatch.stepsLabel')}
        labelFor={(id) => t(`createMatch.steps.${id}`)}
        isStepEnabled={isStepEnabled}
        isLocked={create.isPending}
        onStepSelect={goToStep}
      />
      <CreateMatchForm
        step={step}
        isLastStep={step === stepCount}
        values={{
          title,
          location,
          maxPlayers,
          pitchCost,
          matchDate,
          matchTime,
          recurrence,
          endMode,
          occurrenceCount,
          canUntilSeason,
        }}
        weekdayName={weekdayName}
        dayOfMonth={dayOfMonth}
        isPending={create.isPending}
        onTitleChange={setTitle}
        onLocationChange={setLocation}
        onMaxPlayersChange={setMaxPlayers}
        onPitchCostChange={setPitchCost}
        onDateChange={setMatchDate}
        onTimeChange={setMatchTime}
        onRecurrenceChange={setRecurrence}
        onEndModeChange={setEndMode}
        onOccurrenceCountChange={setOccurrenceCount}
        onBack={() => goToStep(step - 1)}
        onNext={handleNext}
      />
    </div>
  )
}
