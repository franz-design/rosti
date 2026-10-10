import { SportType } from '../auth/entities/organization.entity'
import { type PlayerSkillKey } from './contracts/stats.contract'

const FOOTBALL_SKILLS = [
  'defense',
  'attack',
  'passing',
  'shooting',
  'vision',
  'endurance',
  'physical',
  'goalkeeping',
] as const satisfies readonly PlayerSkillKey[]

const BASKETBALL_SKILLS = [
  'shooting',
  'passing',
  'dribbling',
  'defense',
  'rebounding',
  'speed',
  'vision',
  'physical',
] as const satisfies readonly PlayerSkillKey[]

const VOLLEYBALL_SKILLS = [
  'serve',
  'reception',
  'setting',
  'attack',
  'block',
  'defense',
  'positioning',
  'reading',
] as const satisfies readonly PlayerSkillKey[]

const TENNIS_SKILLS = [
  'serve',
  'forehand',
  'backhand',
  'volley',
  'smash',
  'footwork',
  'endurance',
  'consistency',
] as const satisfies readonly PlayerSkillKey[]

const PADEL_SKILLS = [
  'serve',
  'forehand',
  'backhand',
  'volley',
  'smash',
  'bandeja',
  'defense',
  'walls',
] as const satisfies readonly PlayerSkillKey[]

const BADMINTON_SKILLS = [
  'serve',
  'clear',
  'drop',
  'smash',
  'netPlay',
  'defense',
  'footwork',
  'endurance',
] as const satisfies readonly PlayerSkillKey[]

const PLAYER_SKILLS_BY_SPORT: Record<
  Exclude<SportType, SportType.Other>,
  readonly PlayerSkillKey[]
> = {
  [SportType.Football]: FOOTBALL_SKILLS,
  [SportType.Futsal]: FOOTBALL_SKILLS,
  [SportType.Basketball]: BASKETBALL_SKILLS,
  [SportType.Volleyball]: VOLLEYBALL_SKILLS,
  [SportType.Tennis]: TENNIS_SKILLS,
  [SportType.Padel]: PADEL_SKILLS,
  [SportType.Badminton]: BADMINTON_SKILLS,
}

export interface SkillRating {
  key: PlayerSkillKey
  value: number
}

export interface SkillRatings {
  sportType: SportType
  skills: SkillRating[]
}

export function skillKeysForSport(
  sportType: SportType | null | undefined,
): readonly PlayerSkillKey[] | null {
  if (sportType == null || sportType === SportType.Other) return null
  return PLAYER_SKILLS_BY_SPORT[sportType]
}

export function buildSkillRatings(
  sportType: SportType | null | undefined,
  stored: ReadonlyArray<{ skill: string; value: number }>,
): SkillRatings | null {
  const keys = skillKeysForSport(sportType)
  if (!keys || sportType == null) return null

  const values = new Map(stored.map((row) => [row.skill, row.value]))
  return {
    sportType,
    skills: keys.map((key) => ({
      key,
      value: clampSkillValue(values.get(key)),
    })),
  }
}

function clampSkillValue(value: number | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0
  return Math.min(10, Math.max(0, Math.round(value)))
}
