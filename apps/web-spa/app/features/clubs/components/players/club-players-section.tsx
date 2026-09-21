import { Input } from '@rosti/ui/components/primitives/input'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { filterPlayersByName } from '@/features/clubs/utils/filter-players'
import { authClient } from '@/lib/auth-client'
import { rostiApi } from '@/lib/rosti-api'
import { ClubPlayerRow } from './club-player-row'
import type { PlayerRow } from './player-row'

interface PendingInvitation {
  id: string
  email: string
  role: string
  status: string
  organizationId: string
  expiresAt: string | Date
}

interface ClubPlayersSectionProps {
  organizationId: string
  currentUserId: string | undefined
}

export function ClubPlayersSection({ organizationId, currentUserId }: ClubPlayersSectionProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const playersQueryKey = ['club-players', organizationId] as const

  const { data: rows = [], isLoading } = useQuery({
    queryKey: playersQueryKey,
    queryFn: async (): Promise<PlayerRow[]> => {
      const [members, invitationsResult] = await Promise.all([
        rostiApi.listMembers(organizationId),
        authClient.organization.listInvitations({
          query: { organizationId },
        }),
      ])

      if (invitationsResult.error) {
        throw new Error(invitationsResult.error.message)
      }

      const pending = ((invitationsResult.data ?? []) as PendingInvitation[]).filter(
        (invitation) => invitation.status === 'pending',
      )

      const memberRows: PlayerRow[] = members.map((member) => ({
        kind: 'member' as const,
        id: member.id,
        email: member.email,
        name: member.name || member.email,
        role: member.role,
        canRemove: member.role !== 'owner' && member.userId !== currentUserId,
        canChangeRole: member.role !== 'owner',
      }))

      const invitationRows: PlayerRow[] = pending.map((invitation) => ({
        kind: 'invitation' as const,
        id: invitation.id,
        email: invitation.email,
        name: invitation.email,
        canRemove: true,
      }))

      return [...memberRows, ...invitationRows]
    },
  })

  const invalidatePlayers = () => {
    void queryClient.invalidateQueries({ queryKey: playersQueryKey })
    void queryClient.invalidateQueries({ queryKey: ['club-members', organizationId] })
  }

  const resend = useMutation({
    mutationFn: async (email: string) => {
      const result = await authClient.organization.inviteMember({
        email,
        role: 'member',
        organizationId,
        resend: true,
      })
      if (result.error) throw new Error(result.error.message)
    },
    onSuccess: () => {
      toast.success(t('clubSettings.players.resent'))
      invalidatePlayers()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const changeRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'admin' | 'member' }) => {
      await rostiApi.updateMemberRole(organizationId, memberId, role)
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.role === 'admin'
          ? t('clubSettings.players.promoted')
          : t('clubSettings.players.demoted'),
      )
      invalidatePlayers()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const remove = useMutation({
    mutationFn: async (row: PlayerRow) => {
      if (row.kind === 'member') {
        const result = await authClient.organization.removeMember({
          memberIdOrEmail: row.id,
          organizationId,
        })
        if (result.error) throw new Error(result.error.message)
        return
      }

      const result = await authClient.organization.cancelInvitation({
        invitationId: row.id,
      })
      if (result.error) throw new Error(result.error.message)
    },
    onSuccess: () => {
      toast.success(t('clubSettings.players.removed'))
      invalidatePlayers()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const isBusy = resend.isPending || remove.isPending || changeRole.isPending
  const visibleRows = filterPlayersByName(rows, search)

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    setSearch(event.target.value)
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-medium">{t('clubSettings.players.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('clubSettings.players.hint')}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {t('common.loading')}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('clubSettings.players.empty')}</p>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder={t('clubSettings.players.searchPlaceholder')}
              aria-label={t('clubSettings.players.searchLabel')}
              autoComplete="off"
              className="pl-8"
            />
          </div>
          {visibleRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('clubSettings.players.noResults')}</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {visibleRows.map((row) => (
                <ClubPlayerRow
                  key={`${row.kind}-${row.id}`}
                  row={row}
                  isBusy={isBusy}
                  onResend={(email) => resend.mutate(email)}
                  onChangeRole={(memberId, role) => changeRole.mutate({ memberId, role })}
                  onRemove={(player) => remove.mutate(player)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
