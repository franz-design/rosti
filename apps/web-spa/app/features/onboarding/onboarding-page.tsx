import { toast } from '@rosti/ui/components/primitives/sonner'
import { AppLoader } from '@rosti/ui/components/app'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { acceptPendingInvitations } from '@/features/auth/utils/pending-invitation'
import { storeActiveClubId } from '@/features/clubs/utils/club-session'
import { combineDateAndTime } from '@/features/matches/utils/match-schedule-utils'
import {
  clampMatchDateToSeason,
  endOfCalendarDay,
  parseCalendarDate,
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
import {
  clearOnboardingDraft,
  clubSlug,
  createDefaultOnboardingDraft,
  getScheduleIssue,
  isAlreadyInvited,
  isOnboardingStepReachable,
  isOrganizationNameTaken,
  isSportStepFilled,
  readOnboardingDraft,
  writeOnboardingDraft,
  type OnboardingDraft,
  type OnboardingRecurrence,
  type ScheduleIssue,
} from './utils/onboarding-draft'

const SCHEDULE_ERROR_KEYS = {
  requiredFields: 'onboarding.errors.requiredFields',
  seasonEndBeforeStart: 'onboarding.errors.seasonEndBeforeStart',
  matchOutsideSeason: 'onboarding.errors.matchOutsideSeason',
} as const satisfies Record<ScheduleIssue, string>

class OnboardingHandledError extends Error {
  constructor() {
    super('onboarding-handled')
  }
}

export default function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [draft, setDraft] = useState<OnboardingDraft>(
    () => readOnboardingDraft() ?? createDefaultOnboardingDraft(),
  )
  const [nameError, setNameError] = useState<string | null>(null)
  const [isCheckingName, setIsCheckingName] = useState(false)
  const draftRef = useRef(draft)
  const submittedRef = useRef(false)
  draftRef.current = draft

  const updateDraft = (updater: (current: OnboardingDraft) => OnboardingDraft) => {
    const next = updater(draftRef.current)
    draftRef.current = next
    if (!submittedRef.current) writeOnboardingDraft(next)
    setDraft(next)
    return next
  }

  const setStep = (step: number) => updateDraft((current) => ({ ...current, step }))

  const { data: existingClubs, isLoading: isClubsLoading } = useQuery({
    queryKey: ['clubs', session?.user?.id, 'onboarding-gate'],
    queryFn: async () => {
      await acceptPendingInvitations()
      return rostiApi.listClubs()
    },
    enabled: !!session?.user && !draft.createdClubId,
  })

  useEffect(() => {
    if (draft.createdClubId || !existingClubs?.length) return
    submittedRef.current = true
    clearOnboardingDraft()
  }, [draft.createdClubId, existingClubs])

  const weekdayName = draft.matchDate
    ? parseCalendarDate(draft.matchDate).toLocaleDateString('fr-FR', { weekday: 'long' })
    : ''
  const dayOfMonth = draft.matchDate ? parseCalendarDate(draft.matchDate).getDate() : 1
  const seasonStartsAt = parseCalendarDate(draft.seasonStartsAt)
  const seasonEndsAt = parseCalendarDate(draft.seasonEndsAt)
  const matchDate = draft.matchDate ? parseCalendarDate(draft.matchDate) : undefined

  const handleSeasonStartsAtChange = (value: Date | undefined) => {
    if (!value) return
    updateDraft((current) => {
      const nextMatch = current.matchDate
        ? clampMatchDateToSeason(
            parseCalendarDate(current.matchDate),
            value,
            parseCalendarDate(current.seasonEndsAt),
          )
        : undefined
      return {
        ...current,
        seasonStartsAt: toCalendarDateString(value),
        matchDate: nextMatch ? toCalendarDateString(nextMatch) : current.matchDate,
      }
    })
  }

  const handleSeasonEndsAtChange = (value: Date | undefined) => {
    if (!value) return
    updateDraft((current) => {
      const nextMatch = current.matchDate
        ? clampMatchDateToSeason(
            parseCalendarDate(current.matchDate),
            parseCalendarDate(current.seasonStartsAt),
            value,
          )
        : undefined
      return {
        ...current,
        seasonEndsAt: toCalendarDateString(value),
        matchDate: nextMatch ? toCalendarDateString(nextMatch) : current.matchDate,
      }
    })
  }

  const handleMatchDateChange = (value: Date | undefined) => {
    updateDraft((current) => {
      if (!value) return { ...current, matchDate: null }
      const next = clampMatchDateToSeason(
        value,
        parseCalendarDate(current.seasonStartsAt),
        parseCalendarDate(current.seasonEndsAt),
      )
      return { ...current, matchDate: toCalendarDateString(next) }
    })
  }

  const rejectTakenName = () => {
    updateDraft((current) => ({ ...current, step: 1, confirmedSlug: null }))
    setNameError(t('onboarding.errors.nameTaken'))
    throw new OnboardingHandledError()
  }

  const ensureClubNameAvailable = async () => {
    const current = draftRef.current
    const name = current.clubName.trim()
    if (!name || !current.venue.trim()) {
      setStep(1)
      toast.error(t('onboarding.errors.requiredFields'))
      return false
    }

    const slug = clubSlug(name)
    if (!slug) {
      setStep(1)
      setNameError(t('onboarding.errors.nameInvalid'))
      return false
    }

    if (current.createdClubId && current.createdSlug === slug) {
      if (current.confirmedSlug !== slug) {
        updateDraft((next) => ({ ...next, confirmedSlug: slug }))
      }
      setNameError(null)
      return true
    }

    const mustCheck = current.step === 1 || current.confirmedSlug !== slug
    if (!mustCheck) return true

    setIsCheckingName(true)
    try {
      const result = await authClient.organization.checkSlug({ slug })
      if (result.error) {
        if (isOrganizationNameTaken(result.error)) {
          updateDraft((next) => ({ ...next, step: 1, confirmedSlug: null }))
          setNameError(t('onboarding.errors.nameTaken'))
          return false
        }
        toast.error(result.error.message || t('onboarding.errors.checkName'))
        return false
      }
      updateDraft((next) => ({ ...next, confirmedSlug: slug }))
      setNameError(null)
      return true
    } finally {
      setIsCheckingName(false)
    }
  }

  const goToStep = async (target: number) => {
    if (target === draftRef.current.step) return true
    if (target < draftRef.current.step) {
      setStep(target)
      return true
    }

    const available = await ensureClubNameAvailable()
    if (!available) return false

    if (target >= 3 && !isSportStepFilled(draftRef.current)) {
      setStep(2)
      toast.error(t('onboarding.errors.maxPlayers'))
      return false
    }

    if (target >= 4) {
      const issue = getScheduleIssue(draftRef.current)
      if (issue) {
        setStep(3)
        toast.error(t(SCHEDULE_ERROR_KEYS[issue]))
        return false
      }
    }

    setStep(target)
    return true
  }

  const finish = useMutation({
    mutationFn: async (sendInvites: boolean) => {
      const current = draftRef.current
      const name = current.clubName.trim()
      const venue = current.venue.trim()
      const slug = clubSlug(name)
      if (!name || !venue || !slug) {
        setStep(1)
        setNameError(slug ? null : t('onboarding.errors.nameInvalid'))
        if (slug) toast.error(t('onboarding.errors.requiredFields'))
        throw new OnboardingHandledError()
      }
      if (!isSportStepFilled(current)) {
        setStep(2)
        toast.error(t('onboarding.errors.maxPlayers'))
        throw new OnboardingHandledError()
      }
      const scheduleIssue = getScheduleIssue(current)
      if (scheduleIssue || !current.matchDate) {
        setStep(3)
        toast.error(t(SCHEDULE_ERROR_KEYS[scheduleIssue ?? 'requiredFields']))
        throw new OnboardingHandledError()
      }

      let clubId = current.createdClubId
      if (!clubId) {
        const check = await authClient.organization.checkSlug({ slug })
        if (check.error) {
          if (isOrganizationNameTaken(check.error)) rejectTakenName()
          throw new Error(check.error.message || t('onboarding.errors.checkName'))
        }
        const created = await authClient.organization.create({ name, slug })
        if (created.error) {
          if (isOrganizationNameTaken(created.error)) rejectTakenName()
          throw new Error(created.error.message || t('onboarding.errors.createClub'))
        }
        clubId = created.data?.id
        if (!clubId) throw new Error(t('onboarding.errors.createClub'))
        updateDraft((next) => ({
          ...next,
          createdClubId: clubId,
          createdSlug: slug,
          createdName: name,
          confirmedSlug: slug,
        }))
      } else if (current.createdSlug !== slug || current.createdName !== name) {
        if (current.createdSlug !== slug) {
          const check = await authClient.organization.checkSlug({ slug })
          if (check.error) {
            if (isOrganizationNameTaken(check.error)) rejectTakenName()
            throw new Error(check.error.message || t('onboarding.errors.checkName'))
          }
        }
        const updated = await authClient.organization.update({
          organizationId: clubId,
          data: { name, slug },
        })
        if (updated.error) {
          if (isOrganizationNameTaken(updated.error)) rejectTakenName()
          throw new Error(updated.error.message)
        }
        updateDraft((next) => ({
          ...next,
          createdSlug: slug,
          createdName: name,
          confirmedSlug: slug,
        }))
      }

      await authClient.organization.setActive({ organizationId: clubId })
      storeActiveClubId(clubId)

      await rostiApi.updateClub(clubId, {
        name,
        venue,
        sportType: current.sportType,
        defaultMaxCapacity: current.maxPlayers,
      })

      const latest = draftRef.current
      let seasonId = latest.createdSeasonId
      const seasonStarts = parseCalendarDate(latest.seasonStartsAt)
      const seasonEnds = parseCalendarDate(latest.seasonEndsAt)
      const seasonName = t('onboarding.step3.seasonName', {
        year: seasonWindowLabel(seasonStarts, seasonEnds),
      })
      if (!seasonId) {
        const seasons = await rostiApi.listSeasons(clubId)
        seasonId = seasons.find((season) => season.status === 'active')?.id ?? null
        if (!seasonId) {
          const season = await rostiApi.createSeason(clubId, {
            name: seasonName,
            startsAt: latest.seasonStartsAt,
            endsAt: latest.seasonEndsAt,
          })
          seasonId = season.id
        }
        updateDraft((next) => ({ ...next, createdSeasonId: seasonId }))
      }

      if (!draftRef.current.matchesCreated && seasonId && draftRef.current.matchDate) {
        await rostiApi.updateSeason(clubId, seasonId, {
          name: seasonName,
          startsAt: draftRef.current.seasonStartsAt,
          endsAt: draftRef.current.seasonEndsAt,
        })
        const startsAt = combineDateAndTime(
          parseCalendarDate(draftRef.current.matchDate),
          draftRef.current.matchTime,
        )
        await rostiApi.createMatches(clubId, {
          seasonId,
          title: t('onboarding.step3.matchTitle', { club: name }),
          startsAt: startsAt.toISOString(),
          location: venue,
          maxCapacity: draftRef.current.maxPlayers,
          recurrence: {
            frequency: draftRef.current.recurrence,
            endsAt: endOfCalendarDay(
              parseCalendarDate(draftRef.current.seasonEndsAt),
            ).toISOString(),
          },
        })
        updateDraft((next) => ({ ...next, matchesCreated: true }))
      }

      if (sendInvites) {
        for (const email of draftRef.current.emails) {
          if (draftRef.current.invitedEmails.includes(email)) continue
          const result = await authClient.organization.inviteMember({
            email,
            role: 'member',
            organizationId: clubId,
          })
          if (result.error && !isAlreadyInvited(result.error)) {
            throw new Error(result.error.message)
          }
          updateDraft((next) => ({
            ...next,
            invitedEmails: next.invitedEmails.includes(email)
              ? next.invitedEmails
              : [...next.invitedEmails, email],
          }))
        }
      }

      submittedRef.current = true
      clearOnboardingDraft()
    },
    onSuccess: () => {
      toast.success(t('onboarding.done'))
      navigate('/dashboard')
    },
    onError: (error: Error) => {
      if (error instanceof OnboardingHandledError) return
      toast.error(error.message)
    },
  })

  const isStepEnabled = (target: number) =>
    target <= draft.step || isOnboardingStepReachable(draft, target)

  const handleFinish = (sendInvites: boolean) => {
    void goToStep(4).then((opened) => {
      if (!opened) return
      finish.mutate(sendInvites)
    })
  }

  if (isSessionPending || (session && isClubsLoading && !draft.createdClubId)) {
    return <AppLoader />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!draft.createdClubId && existingClubs && existingClubs.length > 0) {
    return <Navigate to="/dashboard" replace />
  }

  const isLocked = isCheckingName || finish.isPending

  return (
    <div className="space-y-8">
      <OnboardingHeader
        step={draft.step}
        isStepEnabled={isStepEnabled}
        isLocked={isLocked}
        onStepSelect={(target) => void goToStep(target)}
      />

      {draft.step === 1 ? (
        <ClubStep
          clubName={draft.clubName}
          venue={draft.venue}
          nameError={nameError}
          isPending={isLocked}
          onClubNameChange={(value) => {
            setNameError(null)
            updateDraft((current) => ({
              ...current,
              clubName: value,
              confirmedSlug:
                clubSlug(value) === current.confirmedSlug ? current.confirmedSlug : null,
            }))
          }}
          onVenueChange={(value) => updateDraft((current) => ({ ...current, venue: value }))}
          onNext={() => void goToStep(2)}
        />
      ) : null}

      {draft.step === 2 ? (
        <SportStep
          sportType={draft.sportType}
          maxPlayers={draft.maxPlayers}
          isPending={isLocked}
          onSportChange={(value: SportType) =>
            updateDraft((current) => ({ ...current, sportType: value }))
          }
          onMaxPlayersChange={(value) =>
            updateDraft((current) => ({ ...current, maxPlayers: value }))
          }
          onBack={() => setStep(1)}
          onNext={() => void goToStep(3)}
        />
      ) : null}

      {draft.step === 3 ? (
        <ScheduleStep
          seasonStartsAt={seasonStartsAt}
          seasonEndsAt={seasonEndsAt}
          matchDate={matchDate}
          matchTime={draft.matchTime}
          recurrence={draft.recurrence}
          weekdayName={weekdayName}
          dayOfMonth={dayOfMonth}
          isPending={isLocked}
          onSeasonStartsAtChange={handleSeasonStartsAtChange}
          onSeasonEndsAtChange={handleSeasonEndsAtChange}
          onDateChange={handleMatchDateChange}
          onTimeChange={(value) => updateDraft((current) => ({ ...current, matchTime: value }))}
          onRecurrenceChange={(value: OnboardingRecurrence) =>
            updateDraft((current) => ({ ...current, recurrence: value }))
          }
          onBack={() => setStep(2)}
          onNext={() => void goToStep(4)}
        />
      ) : null}

      {draft.step === 4 ? (
        <InvitesStep
          emails={draft.emails}
          isPending={isLocked}
          onEmailsChange={(emails) => updateDraft((current) => ({ ...current, emails }))}
          onSend={() => handleFinish(true)}
          onSkip={() => handleFinish(false)}
          onBack={() => setStep(3)}
        />
      ) : null}
    </div>
  )
}
