import { AppLoader } from '@rosti/ui/components/app'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'
import { rostiApi, type Season } from '@/lib/rosti-api'
import { SeasonFormDialog } from './components/season-form-dialog'
import { SeasonsHeader } from './components/seasons-header'
import { SeasonsList } from './components/seasons-list'
import {
  seasonToFormValues,
  suggestedSeasonStart,
  toCalendarDateString,
  type SeasonFormValues,
} from './utils/season-dates'
import { fetchSeasonsQueryOptions } from './utils/seasons-queries'

interface SeasonDraft {
  mode: 'create' | 'edit'
  seasonId?: string
  values: SeasonFormValues
}

export default function SeasonsPage() {
  const { t, i18n } = useTranslation()
  const { activeClub, isClubAdmin, isMembershipLoading, isLoading } = useClub()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<SeasonDraft | null>(null)
  const dateLocale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'

  const { data: seasons = [], isLoading: isSeasonsLoading } = useQuery({
    ...fetchSeasonsQueryOptions(activeClub?.id ?? ''),
    enabled: !!activeClub,
  })
  const activeSeason = seasons.find((season) => season.status === 'active')

  const refreshSeasons = async () => {
    if (!activeClub) return
    await queryClient.invalidateQueries({ queryKey: ['seasons', activeClub.id] })
    await queryClient.invalidateQueries({ queryKey: ['home-stats', activeClub.id] })
    await queryClient.invalidateQueries({ queryKey: ['season', activeClub.id] })
  }

  const saveSeason = useMutation({
    mutationFn: async (input: SeasonDraft) => {
      if (!activeClub) throw new Error(t('seasons.noClub'))
      const body = {
        name: input.values.name.trim(),
        startsAt: toCalendarDateString(input.values.startsAt),
        endsAt: input.values.endsAt ? toCalendarDateString(input.values.endsAt) : null,
      }
      if (input.mode === 'create') {
        return rostiApi.createSeason(activeClub.id, {
          name: body.name,
          startsAt: body.startsAt,
          ...(body.endsAt ? { endsAt: body.endsAt } : {}),
        })
      }
      return rostiApi.updateSeason(activeClub.id, input.seasonId!, {
        name: body.name,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
      })
    },
    onSuccess: async (saved) => {
      const previous = activeSeason && activeSeason.id !== saved.id ? activeSeason : undefined
      if (saved.status === 'active' && previous) {
        toast.success(
          t('seasons.savedClosedPrevious', { name: saved.name, previous: previous.name }),
        )
      } else {
        toast.success(t('seasons.saved', { name: saved.name }))
      }
      setDraft(null)
      await refreshSeasons()
    },
    onError: () => toast.error(t('seasons.saveError')),
  })

  const setStatus = useMutation({
    mutationFn: async (season: Season) => {
      if (!activeClub) throw new Error(t('seasons.noClub'))
      const status = season.status === 'active' ? 'closed' : 'active'
      return rostiApi.updateSeason(activeClub.id, season.id, { status })
    },
    onSuccess: async (saved, season) => {
      const previous = activeSeason && activeSeason.id !== saved.id ? activeSeason : undefined
      if (saved.status === 'active' && previous) {
        toast.success(
          t('seasons.savedClosedPrevious', { name: saved.name, previous: previous.name }),
        )
      } else if (season.status === 'active') {
        toast.success(t('seasons.closed', { name: saved.name }))
      } else {
        toast.success(t('seasons.reopened', { name: saved.name }))
      }
      await refreshSeasons()
    },
    onError: () => toast.error(t('seasons.saveError')),
  })

  const openCreate = () => {
    const startsAt = suggestedSeasonStart(activeSeason?.endsAt, new Date())
    setDraft({
      mode: 'create',
      values: {
        name: t('seasons.defaultName', { year: startsAt.getFullYear() }),
        startsAt,
        endsAt: null,
      },
    })
  }

  if (isLoading || isMembershipLoading) return <AppLoader />
  if (!activeClub) return <p>{t('seasons.noClub')}</p>

  return (
    <div className="space-y-6">
      <SeasonsHeader clubName={activeClub.name} canManage={isClubAdmin} onCreate={openCreate} />
      <SeasonsList
        seasons={seasons}
        isLoading={isSeasonsLoading}
        dateLocale={dateLocale}
        canManage={isClubAdmin}
        pendingSeasonId={setStatus.isPending ? setStatus.variables?.id : undefined}
        onCreate={openCreate}
        onEdit={(season) =>
          setDraft({ mode: 'edit', seasonId: season.id, values: seasonToFormValues(season) })
        }
        onToggleStatus={(season) => setStatus.mutate(season)}
      />
      {draft ? (
        <SeasonFormDialog
          open
          mode={draft.mode}
          initialValues={draft.values}
          dateLocale={dateLocale}
          activeSeasonName={draft.mode === 'create' ? activeSeason?.name : undefined}
          isPending={saveSeason.isPending}
          onOpenChange={(open) => {
            if (!open) setDraft(null)
          }}
          onSubmit={(values) => saveSeason.mutate({ ...draft, values })}
        />
      ) : null}
    </div>
  )
}
