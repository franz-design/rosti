import { AppLoader } from '@rosti/ui/components/app'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { authClient } from '@/lib/auth-client'
import { rostiApi, type Club } from '@/lib/rosti-api'
import { clearClubChoiceRequired, storeActiveClubId } from './utils/club-session'

export default function ChooseClubPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    clearClubChoiceRequired()
  }, [])

  const {
    data: clubs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['clubs', session?.user?.id, 'choose'],
    queryFn: () => rostiApi.listClubs(),
    enabled: !!session?.user,
  })

  const sortedClubs = useMemo(
    () => [...clubs].sort((left, right) => left.name.localeCompare(right.name)),
    [clubs],
  )

  const openClub = useCallback(
    async (clubId: string) => {
      setError(null)
      setPendingId(clubId)
      const result = await authClient.organization.setActive({ organizationId: clubId })
      if (result.error) {
        setPendingId(null)
        setError(result.error.message || t('chooseClub.error'))
        return
      }
      storeActiveClubId(clubId)
      navigate('/dashboard')
    },
    [navigate, t],
  )

  const onlyClubId = clubs.length === 1 ? clubs[0]?.id : undefined

  useEffect(() => {
    if (!session || !onlyClubId || pendingId || error) return
    void openClub(onlyClubId)
  }, [error, onlyClubId, openClub, pendingId, session])

  if (isSessionPending || (session && isLoading)) return <AppLoader />
  if (!session) return <Navigate to="/login" replace />
  if (clubs.length === 0 && !isError) return <Navigate to="/onboarding" replace />

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-black tracking-tight">{t('chooseClub.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('chooseClub.description')}</p>
      </div>
      {isError ? <p className="text-sm text-destructive">{t('chooseClub.error')}</p> : null}
      <ul className="space-y-3">
        {sortedClubs.map((club) => (
          <li key={club.id}>
            <ClubChoiceButton
              club={club}
              disabled={pendingId !== null}
              onChoose={() => void openClub(club.id)}
            />
          </li>
        ))}
      </ul>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function ClubChoiceButton({
  club,
  disabled,
  onChoose,
}: {
  club: Club
  disabled: boolean
  onChoose: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChoose}
      className="flex w-full flex-col items-start gap-1 rounded-xl border bg-sidebar p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
    >
      <span className="font-semibold">{club.name}</span>
      {club.venue ? <span className="text-sm text-muted-foreground">{club.venue}</span> : null}
    </button>
  )
}
