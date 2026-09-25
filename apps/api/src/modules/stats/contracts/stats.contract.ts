import { z } from 'zod'

export const matchStatSchema = z
  .object({
    id: z.string().uuid(),
    matchId: z.string().uuid(),
    userId: z.string().uuid(),
    userName: z.string(),
    image: z.string().nullish(),
    goals: z.number().int().nonnegative(),
    assists: z.number().int().nonnegative(),
  })
  .meta({ title: 'MatchStatSchema' })

export type MatchStatDto = z.infer<typeof matchStatSchema>
export const matchStatsSchema = z.array(matchStatSchema)

export const upsertMatchStatsSchema = z
  .object({
    stats: z.array(
      z.object({
        userId: z.string().uuid(),
        goals: z.number().int().nonnegative(),
        assists: z.number().int().nonnegative(),
      }),
    ),
  })
  .meta({ title: 'UpsertMatchStatsSchema' })

export type UpsertMatchStatsInput = z.infer<typeof upsertMatchStatsSchema>

export const seasonPlayerStatSchema = z
  .object({
    userId: z.string().uuid(),
    userName: z.string(),
    image: z.string().nullish(),
    goals: z.number().int(),
    assists: z.number().int(),
    matchesPlayed: z.number().int(),
  })
  .meta({ title: 'SeasonPlayerStatSchema' })

export type SeasonPlayerStatDto = z.infer<typeof seasonPlayerStatSchema>
export const seasonPlayerStatsSchema = z.array(seasonPlayerStatSchema)

export const playerRefSchema = z
  .object({
    userId: z.string().uuid(),
    userName: z.string(),
    image: z.string().nullish(),
  })
  .meta({ title: 'PlayerRefSchema' })

export type PlayerRefDto = z.infer<typeof playerRefSchema>

export const playerHighlightSchema = z
  .object({
    userId: z.string().uuid(),
    userName: z.string(),
    image: z.string().nullish(),
    value: z.number().int().nonnegative(),
  })
  .meta({ title: 'PlayerHighlightSchema' })

export type PlayerHighlightDto = z.infer<typeof playerHighlightSchema>

export const playedTogetherSchema = z
  .object({
    playerA: playerRefSchema,
    playerB: playerRefSchema,
    matchesTogether: z.number().int().nonnegative(),
  })
  .meta({ title: 'PlayedTogetherSchema' })

export type PlayedTogetherDto = z.infer<typeof playedTogetherSchema>

export const clubHomeStatsSchema = z
  .object({
    matchesPlayed: z.number().int().nonnegative(),
    topScorer: playerHighlightSchema.nullable(),
    mostWins: playerHighlightSchema.nullable(),
    mostLosses: playerHighlightSchema.nullable(),
    mostPlayedTogether: playedTogetherSchema.nullable(),
  })
  .meta({ title: 'ClubHomeStatsSchema' })

export const personalHomeStatsSchema = z
  .object({
    matchesPlayed: z.number().int().nonnegative(),
    goals: z.number().int().nonnegative(),
    wins: z.number().int().nonnegative(),
    losses: z.number().int().nonnegative(),
  })
  .meta({ title: 'PersonalHomeStatsSchema' })

export const seasonHomeStatsSchema = z
  .object({
    season: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
      })
      .nullable(),
    club: clubHomeStatsSchema,
    me: personalHomeStatsSchema,
  })
  .meta({ title: 'SeasonHomeStatsSchema' })

export type SeasonHomeStatsDto = z.infer<typeof seasonHomeStatsSchema>
