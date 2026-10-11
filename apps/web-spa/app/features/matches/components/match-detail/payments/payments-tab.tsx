import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { rostiApi, type SessionFee } from '@/lib/rosti-api'
import {
  matchCostQueryOptions,
  matchFeesQueryOptions,
} from '@/features/matches/utils/payment-queries'
import { FeeAdminPanel } from './fee-admin-panel'
import { MyFeeCard } from './my-fee-card'

interface PaymentsTabProps {
  orgId: string
  matchId: string
  currentUserId?: string
  isClubAdmin: boolean
}

export function PaymentsTab({ orgId, matchId, currentUserId, isClubAdmin }: PaymentsTabProps) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const locale = i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR'
  const enabled = orgId.length > 0 && matchId.length > 0

  const { data: cost, isLoading: isCostLoading } = useQuery({
    ...matchCostQueryOptions(orgId, matchId),
    enabled,
  })
  const { data: fees = [], isLoading: isFeesLoading } = useQuery({
    ...matchFeesQueryOptions(orgId, matchId),
    enabled,
  })

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ['match-cost', orgId, matchId] })
    void queryClient.invalidateQueries({ queryKey: ['match-fees', orgId, matchId] })
  }

  const saveCost = useMutation({
    mutationFn: (body: { pitchCostCents: number; extrasCostCents: number }) =>
      rostiApi.upsertMatchCost(orgId, matchId, body),
    onSuccess: () => {
      toast.success(t('matches.detail.payments.costSaved'))
      refresh()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateStatus = useMutation({
    mutationFn: (input: { feeId: string; status: SessionFee['status'] }) =>
      rostiApi.updateFeeStatus(orgId, input.feeId, input.status),
    onSuccess: refresh,
    onError: (err: Error) => toast.error(err.message),
  })

  const updateShares = useMutation({
    mutationFn: (input: { feeId: string; shares: number }) =>
      rostiApi.updateFeeShares(orgId, input.feeId, input.shares),
    onSuccess: refresh,
    onError: (err: Error) => toast.error(err.message),
  })

  const remind = useMutation({
    mutationFn: () => rostiApi.remindUnpaidFees(orgId, matchId),
    onSuccess: (result) => {
      if (result.remindedCount === 0) {
        toast.message(t('matches.detail.payments.nobodyToRemind'))
      } else {
        toast.success(t('matches.detail.payments.reminded', { count: result.remindedCount }))
      }
      refresh()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isCostLoading || isFeesLoading) {
    return <p className="text-sm text-muted-foreground">{t('matches.detail.payments.loading')}</p>
  }

  const myFee = fees.find((fee) => fee.userId === currentUserId)

  return (
    <div className="space-y-6">
      {isClubAdmin ? (
        <FeeAdminPanel
          cost={cost}
          fees={fees}
          locale={locale}
          currentUserId={currentUserId}
          isSavingCost={saveCost.isPending}
          isReminding={remind.isPending}
          onSaveCost={(pitchCostCents, extrasCostCents) =>
            saveCost.mutate({ pitchCostCents, extrasCostCents })
          }
          onSharesChange={(feeId, shares) => updateShares.mutate({ feeId, shares })}
          onStatusChange={(feeId, status) => updateStatus.mutate({ feeId, status })}
          onRemind={() => remind.mutate()}
        />
      ) : (
        <MyFeeCard
          fee={myFee}
          locale={locale}
          isPending={updateStatus.isPending}
          onMarkPaid={() => {
            if (!myFee) return
            updateStatus.mutate({ feeId: myFee.id, status: 'paid' })
          }}
          onUndoPaid={() => {
            if (!myFee) return
            updateStatus.mutate({ feeId: myFee.id, status: 'owed' })
          }}
        />
      )}
    </div>
  )
}
