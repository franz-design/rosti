import { toast } from '@rosti/ui/components/primitives/sonner'
import { AppLoader } from '@rosti/ui/components/app'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { acceptPendingInvitations } from '@/features/auth/utils/pending-invitation'
import { storeActiveClubId } from '@/features/clubs/utils/club-session'
import { authClient } from '@/lib/auth-client'
import { rostiApi, type SportType } from '@/lib/rosti-api'
import { OnboardingHeader } from './components/onboarding-header'
import { ClubStep } from './components/steps/club-step'
import { SportStep } from './components/steps/sport-step'
import {
  clearOnboardingDraft,
  clubSlug,
  createDefaultOnboardingDraft,
  isOnboardingStepReachable,
  isOrganizationNameTaken,
  isSportStepFilled,
  readOnboardingDraft,
  writeOnboardingDraft,
  type OnboardingDraft,
} from './utils/onboarding-draft'

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

    setStep(target)
    return true
  }

  const finish = useMutation({
    mutationFn: async () => {
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
        toast.error(t('onboarding.errors.maxPlayers'))
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

  const handleCreateClub = () => {
    if (!isSportStepFilled(draftRef.current)) {
      toast.error(t('onboarding.errors.maxPlayers'))
      return
    }
    finish.mutate()
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
          onCreate={handleCreateClub}
        />
      ) : null}
    </div>
  )
}
