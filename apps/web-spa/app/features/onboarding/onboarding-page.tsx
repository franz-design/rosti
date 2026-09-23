import { toast } from '@rosti/ui/components/primitives/sonner'
import { AppLoader } from '@rosti/ui/components/app'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { acceptPendingInvitations } from '@/features/auth/utils/pending-invitation'
import {
  combineDateAndTime,
  defaultNextMatchDate,
  type RecurrenceChoice,
} from '@/features/matches/utils/match-schedule-utils'
import {
  clampMatchDateToSeason,
  defaultSeasonWindow,
  endOfCalendarDay,
  isCalendarEndBeforeStart,
  isMatchDateOutsideSeason,
  seasonWindowLabel,
  toCalendarDateString,
} from '@/features/seasons/utils/season-dates'
import { authClient } from '@/lib/auth-client'
import { rostiApi, type SportType } from '@/lib/rosti-api'
import { OnboardingHeader } from './components/onboarding-header'
import { ClubStep } from './components/steps/club-step'
import { InvitesStep } from './components/steps/invites-step'
import { ScheduleStep } from './components/steps/schedule-step'
import { SportStep } from './components/steps/sport-step'
import { slugify } from './utils/slugify'

type OnboardingRecurrence = Exclude<RecurrenceChoice, 'once'>

const initialSeason = defaultSeasonWindow()

export default function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [step, setStep] = useState(1)
  const [clubId, setClubId] = useState<string | null>(null)
  const [clubName, setClubName] = useState('')
  const [venue, setVenue] = useState('')
  const [sportType, setSportType] = useState<SportType>('football')
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [seasonStartsAt, setSeasonStartsAt] = useState(() => initialSeason.startsAt)
  const [seasonEndsAt, setSeasonEndsAt] = useState(() => initialSeason.endsAt)
  const [matchDate, setMatchDate] = useState<Date | undefined>(() =>
    clampMatchDateToSeason(defaultNextMatchDate(), initialSeason.startsAt, initialSeason.endsAt),
  )
  const [matchTime, setMatchTime] = useState('19:00')
  const [recurrence, setRecurrence] = useState<OnboardingRecurrence>('weekly')
  const [emails, setEmails] = useState<string[]>([])

  const { data: existingClubs, isLoading: isClubsLoading } = useQuery({
    queryKey: ['clubs', session?.user?.id, 'onboarding-gate'],
    queryFn: async () => {
      await acceptPendingInvitations()
      return rostiApi.listClubs()
    },
    enabled: !!session?.user && !clubId,
  })

  const weekdayName = useMemo(
    () => (matchDate ? matchDate.toLocaleDateString('fr-FR', { weekday: 'long' }) : ''),
    [matchDate],
  )

  const dayOfMonth = matchDate?.getDate() ?? 1

  const handleSeasonStartsAtChange = (value: Date | undefined) => {
    if (!value) return
    setSeasonStartsAt(value)
    setMatchDate((current) =>
      current ? clampMatchDateToSeason(current, value, seasonEndsAt) : current,
    )
  }

  const handleSeasonEndsAtChange = (value: Date | undefined) => {
    if (!value) return
    setSeasonEndsAt(value)
    setMatchDate((current) =>
      current ? clampMatchDateToSeason(current, seasonStartsAt, value) : current,
    )
  }

  const handleMatchDateChange = (value: Date | undefined) => {
    if (!value) {
      setMatchDate(undefined)
      return
    }
    setMatchDate(clampMatchDateToSeason(value, seasonStartsAt, seasonEndsAt))
  }

  const step1 = useMutation({
    mutationFn: async () => {
      const name = clubName.trim()
      if (!name || !venue.trim()) throw new Error(t('onboarding.errors.requiredFields'))
      const slug = slugify(name) || `club-${Date.now()}`
      const result = await authClient.organization.create({ name, slug })
      if (result.error) throw new Error(result.error.message)
      const id = result.data?.id
      if (!id) throw new Error(t('onboarding.errors.createClub'))
      await rostiApi.updateClub(id, { venue: venue.trim() })
      await authClient.organization.setActive({ organizationId: id })
      localStorage.setItem('rosti.activeClubId', id)
      return id
    },
    onSuccess: (id) => {
      setClubId(id)
      setStep(2)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const step2 = useMutation({
    mutationFn: async () => {
      if (!clubId) throw new Error(t('onboarding.errors.missingClub'))
      if (maxPlayers < 2) throw new Error(t('onboarding.errors.maxPlayers'))
      await rostiApi.updateClub(clubId, {
        sportType,
        defaultMaxCapacity: maxPlayers,
      })
    },
    onSuccess: () => setStep(3),
    onError: (err: Error) => toast.error(err.message),
  })

  const step3 = useMutation({
    mutationFn: async () => {
      if (!clubId || !matchDate) throw new Error(t('onboarding.errors.requiredFields'))
      if (isCalendarEndBeforeStart(seasonStartsAt, seasonEndsAt)) {
        throw new Error(t('onboarding.errors.seasonEndBeforeStart'))
      }
      if (isMatchDateOutsideSeason(matchDate, seasonStartsAt, seasonEndsAt)) {
        throw new Error(t('onboarding.errors.matchOutsideSeason'))
      }

      const seasons = await rostiApi.listSeasons(clubId)
      let seasonId = seasons.find((s) => s.status === 'active')?.id
      if (!seasonId) {
        const season = await rostiApi.createSeason(clubId, {
          name: t('onboarding.step3.seasonName', {
            year: seasonWindowLabel(seasonStartsAt, seasonEndsAt),
          }),
          startsAt: toCalendarDateString(seasonStartsAt),
          endsAt: toCalendarDateString(seasonEndsAt),
        })
        seasonId = season.id
      }
      const startsAt = combineDateAndTime(matchDate, matchTime)
      await rostiApi.createMatches(clubId, {
        seasonId,
        title: t('onboarding.step3.matchTitle', { club: clubName }),
        startsAt: startsAt.toISOString(),
        location: venue.trim(),
        maxCapacity: maxPlayers,
        recurrence: {
          frequency: recurrence,
          endsAt: endOfCalendarDay(seasonEndsAt).toISOString(),
        },
      })
    },
    onSuccess: () => setStep(4),
    onError: (err: Error) => toast.error(err.message),
  })

  const step4 = useMutation({
    mutationFn: async () => {
      if (!clubId) throw new Error(t('onboarding.errors.missingClub'))
      for (const email of emails) {
        const result = await authClient.organization.inviteMember({
          email,
          role: 'member',
          organizationId: clubId,
        })
        if (result.error) throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      toast.success(t('onboarding.done'))
      navigate('/dashboard')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const isPending = step1.isPending || step2.isPending || step3.isPending || step4.isPending

  if (isSessionPending || (session && isClubsLoading && !clubId)) {
    return <AppLoader />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!clubId && existingClubs && existingClubs.length > 0) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 py-4">
      <OnboardingHeader step={step} total={4} />

      {step === 1 ? (
        <ClubStep
          clubName={clubName}
          venue={venue}
          isPending={isPending}
          onClubNameChange={setClubName}
          onVenueChange={setVenue}
          onNext={() => step1.mutate()}
        />
      ) : null}

      {step === 2 ? (
        <SportStep
          sportType={sportType}
          maxPlayers={maxPlayers}
          isPending={isPending}
          onSportChange={setSportType}
          onMaxPlayersChange={setMaxPlayers}
          onBack={() => setStep(1)}
          onNext={() => step2.mutate()}
        />
      ) : null}

      {step === 3 ? (
        <ScheduleStep
          seasonStartsAt={seasonStartsAt}
          seasonEndsAt={seasonEndsAt}
          matchDate={matchDate}
          matchTime={matchTime}
          recurrence={recurrence}
          weekdayName={weekdayName}
          dayOfMonth={dayOfMonth}
          isPending={isPending}
          onSeasonStartsAtChange={handleSeasonStartsAtChange}
          onSeasonEndsAtChange={handleSeasonEndsAtChange}
          onDateChange={handleMatchDateChange}
          onTimeChange={setMatchTime}
          onRecurrenceChange={setRecurrence}
          onBack={() => setStep(2)}
          onNext={() => step3.mutate()}
        />
      ) : null}

      {step === 4 ? (
        <InvitesStep
          emails={emails}
          isPending={isPending}
          onEmailsChange={setEmails}
          onSend={() => step4.mutate()}
          onSkip={() => navigate('/dashboard')}
          onBack={() => setStep(3)}
        />
      ) : null}
    </div>
  )
}
