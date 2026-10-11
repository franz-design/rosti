import { FeeStatus } from './contracts/payment.contract'

export interface ExistingFeeShare {
  userId: string
  shares: number
  status: FeeStatus
  amountCents: number
}

export interface PlannedFee {
  userId: string
  shares: number
  status: FeeStatus
  amountCents: number
  remove: boolean
}

export interface FeeUpdatePlan {
  sharePriceCents: number
  fees: PlannedFee[]
}

/**
 * Decides the shares for one match.
 * Present players split the full total. A paid player who is no longer present
 * keeps the amount already recorded and is left out of the new split.
 */
export function planFeeUpdates(input: {
  totalCents: number
  presentUserIds: string[]
  existing: ExistingFeeShare[]
}): FeeUpdatePlan {
  const existingByUser = new Map(input.existing.map((fee) => [fee.userId, fee]))
  const presentIds = new Set(input.presentUserIds)

  const presentShares = input.presentUserIds.map((userId) => {
    const current = existingByUser.get(userId)
    return {
      userId,
      shares: current?.shares ?? 1,
      status: current?.status ?? FeeStatus.Owed,
    }
  })

  const totalShares = presentShares.reduce((sum, player) => sum + player.shares, 0)
  const sharePriceCents = totalShares === 0 ? 0 : Math.ceil(input.totalCents / totalShares)

  const fees: PlannedFee[] = presentShares.map((player) => ({
    userId: player.userId,
    shares: player.shares,
    status: player.status,
    amountCents: sharePriceCents * player.shares,
    remove: false,
  }))

  for (const fee of input.existing) {
    if (presentIds.has(fee.userId)) continue
    fees.push({
      userId: fee.userId,
      shares: fee.shares,
      status: fee.status,
      amountCents: fee.amountCents,
      remove: fee.status !== FeeStatus.Paid,
    })
  }

  return { sharePriceCents, fees }
}
