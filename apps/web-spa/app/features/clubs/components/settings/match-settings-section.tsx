import { Button } from '@rosti/ui/components/primitives/button'
import { Input } from '@rosti/ui/components/primitives/input'
import { Label } from '@rosti/ui/components/primitives/label'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useClub } from '@/features/clubs/hooks/club-context'
import { centsToEuroInput, eurosToCents } from '@/features/matches/utils/euros'
import { rostiApi } from '@/lib/rosti-api'

export function MatchSettingsSection() {
  const { t } = useTranslation()
  const { activeClub, refetchClubs } = useClub()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState(false)

  useEffect(() => {
    if (!activeClub) return
    const cents = activeClub.defaultPitchCostCents ?? 0
    setAmount(cents > 0 ? centsToEuroInput(cents) : '')
  }, [activeClub])

  const save = useMutation({
    mutationFn: async () => {
      if (!activeClub) throw new Error(t('clubSettings.noClub'))
      const defaultPitchCostCents = eurosToCents(amount)
      if (defaultPitchCostCents == null) throw new Error(t('clubSettings.matches.invalidAmount'))
      return rostiApi.updateClub(activeClub.id, { defaultPitchCostCents })
    },
    onSuccess: () => {
      setAmountError(false)
      toast.success(t('clubSettings.matches.saved'))
      refetchClubs()
      void queryClient.invalidateQueries({ queryKey: ['matches', activeClub?.id] })
      void queryClient.invalidateQueries({ queryKey: ['match-cost'] })
      void queryClient.invalidateQueries({ queryKey: ['match-fees'] })
    },
    onError: (err: Error) => {
      if (eurosToCents(amount) == null) setAmountError(true)
      toast.error(err.message)
    },
  })

  function handleSave() {
    if (eurosToCents(amount) == null) {
      setAmountError(true)
      return
    }
    setAmountError(false)
    save.mutate()
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">{t('clubSettings.matches.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('clubSettings.matches.hint')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultPitchCost">{t('clubSettings.matches.amount')}</Label>
          <Input
            id="defaultPitchCost"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={t('clubSettings.matches.placeholder')}
            className="w-full lg:w-auto lg:min-w-64"
          />
          {amountError ? (
            <p className="text-sm text-destructive">{t('clubSettings.matches.invalidAmount')}</p>
          ) : null}
        </div>

        <Button onClick={handleSave} disabled={save.isPending} loading={save.isPending}>
          {t('clubSettings.matches.save')}
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">{t('clubSettings.matches.seasonsTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('clubSettings.matches.seasonsHint')}</p>
        <Button variant="outline" render={<Link to="/seasons" />}>
          {t('clubSettings.matches.manageSeasons')}
        </Button>
      </section>
    </div>
  )
}
