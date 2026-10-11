import { z } from 'zod'

export enum FeeStatus {
  Owed = 'owed',
  Paid = 'paid',
  Waived = 'waived',
}

export const matchCostSchema = z
  .object({
    id: z.string().uuid(),
    matchId: z.string().uuid(),
    pitchCostCents: z.number().int().nonnegative(),
    extrasCostCents: z.number().int().nonnegative(),
    perPlayerCents: z.number().int().nonnegative().optional(),
    presentCount: z.number().int().optional(),
  })
  .meta({ title: 'MatchCostSchema' })

export type MatchCostDto = z.infer<typeof matchCostSchema>

export const upsertMatchCostSchema = z
  .object({
    pitchCostCents: z.number().int().nonnegative(),
    extrasCostCents: z.number().int().nonnegative().default(0),
  })
  .meta({ title: 'UpsertMatchCostSchema' })

export type UpsertMatchCostInput = z.infer<typeof upsertMatchCostSchema>

export const sessionFeeSchema = z
  .object({
    id: z.string().uuid(),
    matchId: z.string().uuid(),
    userId: z.string().uuid(),
    userName: z.string(),
    amountCents: z.number().int(),
    shares: z.number().int().positive(),
    status: z.nativeEnum(FeeStatus),
    paidAt: z.coerce.date().nullish(),
    reminderCount: z.number().int().nonnegative(),
    lastRemindedAt: z.coerce.date().nullish(),
    paymentUrl: z.string().url().nullish(),
  })
  .meta({ title: 'SessionFeeSchema' })

export type SessionFeeDto = z.infer<typeof sessionFeeSchema>
export const sessionFeesSchema = z.array(sessionFeeSchema)

export const updateFeeStatusSchema = z
  .object({
    status: z.nativeEnum(FeeStatus),
  })
  .meta({ title: 'UpdateFeeStatusSchema' })

export type UpdateFeeStatusInput = z.infer<typeof updateFeeStatusSchema>

export const updateFeeSharesSchema = z
  .object({
    shares: z.number().int().min(1).max(20),
  })
  .meta({ title: 'UpdateFeeSharesSchema' })

export type UpdateFeeSharesInput = z.infer<typeof updateFeeSharesSchema>

export const remindFeesResultSchema = z
  .object({
    remindedCount: z.number().int().nonnegative(),
  })
  .meta({ title: 'RemindFeesResultSchema' })

export type RemindFeesResultDto = z.infer<typeof remindFeesResultSchema>

export const clubPaymentLinkSchema = z
  .object({
    paymentLink: z.string().url().nullish(),
  })
  .meta({ title: 'ClubPaymentLinkSchema' })

export type ClubPaymentLinkDto = z.infer<typeof clubPaymentLinkSchema>
