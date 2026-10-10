import { z } from 'zod'
import { SportType } from '../../auth/entities/organization.entity'

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
    lastElectedPlayer: playerRefSchema.nullable(),
    /** Latest played match while its best-player vote is still open. */
    openPlayerVoteMatchId: z.string().uuid().nullable(),
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

export const playerSeasonStatsSchema = z
  .object({
    matchesPlayed: z.number().int().nonnegative(),
    goals: z.number().int().nonnegative(),
    assists: z.number().int().nonnegative(),
    wins: z.number().int().nonnegative(),
    losses: z.number().int().nonnegative(),
  })
  .meta({ title: 'PlayerSeasonStatsSchema' })

export type PlayerSeasonStatsDto = z.infer<typeof playerSeasonStatsSchema>

export const playerSkillKeySchema = z.enum([
  'defense',
  'attack',
  'passing',
  'shooting',
  'vision',
  'endurance',
  'physical',
  'goalkeeping',
  'dribbling',
  'rebounding',
  'speed',
  'serve',
  'reception',
  'setting',
  'block',
  'positioning',
  'reading',
  'forehand',
  'backhand',
  'volley',
  'smash',
  'footwork',
  'consistency',
  'bandeja',
  'walls',
  'clear',
  'drop',
  'netPlay',
])

export type PlayerSkillKey = z.infer<typeof playerSkillKeySchema>

export const playerSkillRatingSchema = z
  .object({
    key: playerSkillKeySchema,
    value: z.number().int().min(0).max(10),
  })
  .meta({ title: 'PlayerSkillRatingSchema' })

export const playerSkillRatingsSchema = z
  .object({
    sportType: z.nativeEnum(SportType),
    skills: z.array(playerSkillRatingSchema),
  })
  .meta({ title: 'PlayerSkillRatingsSchema' })

export type PlayerSkillRatingsDto = z.infer<typeof playerSkillRatingsSchema>

export const updatePlayerSkillsSchema = z
  .object({
    skills: z
      .array(
        z.object({
          key: playerSkillKeySchema,
          value: z.number().int().min(0).max(10),
        }),
      )
      .min(1),
  })
  .meta({ title: 'UpdatePlayerSkillsSchema' })

export type UpdatePlayerSkillsInput = z.infer<typeof updatePlayerSkillsSchema>

export const playerDetailSchema = z
  .object({
    userId: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullish(),
    image: z.string().nullish(),
    role: z.enum(['owner', 'admin', 'member']),
    memberSince: z.coerce.date(),
    season: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
      })
      .nullable(),
    stats: playerSeasonStatsSchema,
    skillRatings: playerSkillRatingsSchema.nullable(),
  })
  .meta({ title: 'PlayerDetailSchema' })

export type PlayerDetailDto = z.infer<typeof playerDetailSchema>
