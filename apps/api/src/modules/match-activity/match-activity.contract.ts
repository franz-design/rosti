import { z } from 'zod'
import { AttendanceStatus } from '../matches/contracts/match.contract'
import { FeeStatus } from '../payments/contracts/payment.contract'

/** The part of the match screen an activity belongs to. Admins open one log per area. */
export enum MatchActivityArea {
  Attendance = 'attendance',
  Score = 'score',
  Payment = 'payment',
}

export enum MatchActivityAction {
  AttendanceChanged = 'attendance_changed',
  ScoreChanged = 'score_changed',
  PlayerStatsChanged = 'player_stats_changed',
  MatchCostChanged = 'match_cost_changed',
  FeeStatusChanged = 'fee_status_changed',
  FeeSharesChanged = 'fee_shares_changed',
  FeesReminded = 'fees_reminded',
}

export const MATCH_ACTIVITY_AREA_BY_ACTION: Record<MatchActivityAction, MatchActivityArea> = {
  [MatchActivityAction.AttendanceChanged]: MatchActivityArea.Attendance,
  [MatchActivityAction.ScoreChanged]: MatchActivityArea.Score,
  [MatchActivityAction.PlayerStatsChanged]: MatchActivityArea.Score,
  [MatchActivityAction.MatchCostChanged]: MatchActivityArea.Payment,
  [MatchActivityAction.FeeStatusChanged]: MatchActivityArea.Payment,
  [MatchActivityAction.FeeSharesChanged]: MatchActivityArea.Payment,
  [MatchActivityAction.FeesReminded]: MatchActivityArea.Payment,
}

const attendanceChangedSchema = z.object({
  action: z.literal(MatchActivityAction.AttendanceChanged),
  details: z.object({
    from: z.nativeEnum(AttendanceStatus).nullable(),
    to: z.nativeEnum(AttendanceStatus),
  }),
})

const scoreChangedSchema = z.object({
  action: z.literal(MatchActivityAction.ScoreChanged),
  details: z.object({
    fromBlue: z.number().int().nullable(),
    fromRed: z.number().int().nullable(),
    toBlue: z.number().int().nullable(),
    toRed: z.number().int().nullable(),
  }),
})

const playerStatsChangedSchema = z.object({
  action: z.literal(MatchActivityAction.PlayerStatsChanged),
  details: z.object({
    fromGoals: z.number().int(),
    fromAssists: z.number().int(),
    toGoals: z.number().int(),
    toAssists: z.number().int(),
  }),
})

const matchCostChangedSchema = z.object({
  action: z.literal(MatchActivityAction.MatchCostChanged),
  details: z.object({
    fromPitchCents: z.number().int(),
    fromExtrasCents: z.number().int(),
    toPitchCents: z.number().int(),
    toExtrasCents: z.number().int(),
  }),
})

const feeStatusChangedSchema = z.object({
  action: z.literal(MatchActivityAction.FeeStatusChanged),
  details: z.object({
    from: z.nativeEnum(FeeStatus),
    to: z.nativeEnum(FeeStatus),
  }),
})

const feeSharesChangedSchema = z.object({
  action: z.literal(MatchActivityAction.FeeSharesChanged),
  details: z.object({
    from: z.number().int(),
    to: z.number().int(),
  }),
})

const feesRemindedSchema = z.object({
  action: z.literal(MatchActivityAction.FeesReminded),
  details: z.object({
    remindedCount: z.number().int().nonnegative(),
  }),
})

export const matchActivityEntrySchema = z.discriminatedUnion('action', [
  attendanceChangedSchema,
  scoreChangedSchema,
  playerStatsChangedSchema,
  matchCostChangedSchema,
  feeStatusChangedSchema,
  feeSharesChangedSchema,
  feesRemindedSchema,
])

/** What happened, without who did it. Services build one of these when they record an activity. */
export type MatchActivityEntry = z.infer<typeof matchActivityEntrySchema>

const activityPersonSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  image: z.string().nullish(),
})

export const matchActivitySchema = z
  .intersection(
    z.object({
      id: z.string().uuid(),
      matchId: z.string().uuid(),
      area: z.nativeEnum(MatchActivityArea),
      createdAt: z.coerce.date(),
      actor: activityPersonSchema.nullish(),
      subject: activityPersonSchema.nullish(),
    }),
    matchActivityEntrySchema,
  )
  .meta({
    title: 'Match activity',
    description:
      'One change made by a person on a match. Automatic changes are not logged. Visible to club admins only.',
  })

export type MatchActivityDto = z.infer<typeof matchActivitySchema>

export const matchActivitiesSchema = z.array(matchActivitySchema).meta({
  title: 'Match activities',
  description: 'Latest changes made by people on a match, newest first',
})

export const matchActivityAreaQuerySchema = z.nativeEnum(MatchActivityArea).optional()
