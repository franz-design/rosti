import { describe, expect, it } from 'vitest'
import { FeeStatus } from './contracts/payment.contract'
import { planFeeUpdates } from './fee-split'

describe('planFeeUpdates', () => {
  it('splits an even total into one share per present player', () => {
    const actual = planFeeUpdates({
      totalCents: 3000,
      presentUserIds: ['a', 'b'],
      existing: [],
    })

    expect(actual.sharePriceCents).toBe(1500)
    expect(actual.fees).toEqual([
      { userId: 'a', shares: 1, status: FeeStatus.Owed, amountCents: 1500, remove: false },
      { userId: 'b', shares: 1, status: FeeStatus.Owed, amountCents: 1500, remove: false },
    ])
  })

  it('gives two shares to a player who covers a guest', () => {
    const actual = planFeeUpdates({
      totalCents: 3000,
      presentUserIds: ['a', 'b'],
      existing: [
        { userId: 'a', shares: 2, status: FeeStatus.Owed, amountCents: 0 },
        { userId: 'b', shares: 1, status: FeeStatus.Owed, amountCents: 0 },
      ],
    })

    expect(actual.sharePriceCents).toBe(1000)
    expect(actual.fees.find((fee) => fee.userId === 'a')?.amountCents).toBe(2000)
    expect(actual.fees.find((fee) => fee.userId === 'b')?.amountCents).toBe(1000)
  })

  it('rounds the share price up so the total is covered', () => {
    const actual = planFeeUpdates({
      totalCents: 1000,
      presentUserIds: ['a', 'b', 'c'],
      existing: [],
    })

    expect(actual.sharePriceCents).toBe(334)
    expect(actual.fees.map((fee) => fee.amountCents)).toEqual([334, 334, 334])
  })

  it('keeps a paid status when the amount is recalculated', () => {
    const actual = planFeeUpdates({
      totalCents: 2000,
      presentUserIds: ['a'],
      existing: [{ userId: 'a', shares: 1, status: FeeStatus.Paid, amountCents: 500 }],
    })

    expect(actual.fees[0]).toMatchObject({
      status: FeeStatus.Paid,
      amountCents: 2000,
      remove: false,
    })
  })

  it('removes an unpaid player who is no longer present', () => {
    const actual = planFeeUpdates({
      totalCents: 2000,
      presentUserIds: ['a'],
      existing: [
        { userId: 'a', shares: 1, status: FeeStatus.Owed, amountCents: 1000 },
        { userId: 'b', shares: 1, status: FeeStatus.Owed, amountCents: 1000 },
      ],
    })

    expect(actual.fees.find((fee) => fee.userId === 'b')).toMatchObject({ remove: true })
    expect(actual.fees.find((fee) => fee.userId === 'a')?.amountCents).toBe(2000)
  })

  it('keeps a paid share for a player who is no longer present, without changing the amount', () => {
    const actual = planFeeUpdates({
      totalCents: 2000,
      presentUserIds: ['a'],
      existing: [
        { userId: 'a', shares: 1, status: FeeStatus.Owed, amountCents: 1000 },
        { userId: 'b', shares: 2, status: FeeStatus.Paid, amountCents: 1000 },
      ],
    })

    const kept = actual.fees.find((fee) => fee.userId === 'b')
    expect(kept).toMatchObject({
      remove: false,
      status: FeeStatus.Paid,
      amountCents: 1000,
      shares: 2,
    })
    expect(actual.sharePriceCents).toBe(2000)
  })
})
