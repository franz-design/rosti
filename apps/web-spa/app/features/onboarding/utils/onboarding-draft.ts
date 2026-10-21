import { defaultNextMatchDate } from '../../matches/utils/match-schedule-utils'
import {
  clampMatchDateToSeason,
  defaultSeasonWindow,
  isCalendarEndBeforeStart,
  isMatchDateOutsideSeason,
  parseCalendarDate,
  toCalendarDateString,
} from '../../seasons/utils/season-dates'
import type { SportType } from '../../../lib/rosti-api'
import { slugify } from './slugify'

const STORAGE_KEY = 'rosti.onboarding.draft'

const SPORT_TYPES: readonly SportType[] = [
  'football',
  'futsal',
  'basketball',
  'volleyball',
  'tennis',
  'padel',
  'badminton',
  'other',
]

const RECURRENCES = ['weekly', 'monthly_nth_weekday', 'monthly'] as const

export type OnboardingRecurrence = (typeof RECURRENCES)[number]

export type ScheduleIssue = 'requiredFields' | 'seasonEndBeforeStart' | 'matchOutsideSeason'

export interface OnboardingDraft {
  step: number
  clubName: string
  venue: string
  sportType: SportType
  maxPlayers: number
  seasonStartsAt: string
  seasonEndsAt: string
  matchDate: string | null
  matchTime: string
  recurrence: OnboardingRecurrence
  emails: string[]
  confirmedSlug: string | null
  createdClubId: string | null
  createdSlug: string | null
  createdName: string | null
  createdSeasonId: string | null
  matchesCreated: boolean
  invitedEmails: string[]
}

interface DraftStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function browserStorage(): DraftStorage | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage
}

export function createDefaultOnboardingDraft(today = new Date()): OnboardingDraft {
  const season = defaultSeasonWindow(today)
  const matchDate = clampMatchDateToSeason(defaultNextMatchDate(), season.startsAt, season.endsAt)

  return {
    step: 1,
    clubName: '',
    venue: '',
    sportType: 'football',
    maxPlayers: 10,
    seasonStartsAt: toCalendarDateString(season.startsAt),
    seasonEndsAt: toCalendarDateString(season.endsAt),
    matchDate: toCalendarDateString(matchDate),
    matchTime: '19:00',
    recurrence: 'weekly',
    emails: [],
    confirmedSlug: null,
    createdClubId: null,
    createdSlug: null,
    createdName: null,
    createdSeasonId: null,
    matchesCreated: false,
    invitedEmails: [],
  }
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isSportType(value: unknown): value is SportType {
  return typeof value === 'string' && SPORT_TYPES.includes(value as SportType)
}

function isRecurrence(value: unknown): value is OnboardingRecurrence {
  return typeof value === 'string' && RECURRENCES.includes(value as OnboardingRecurrence)
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

export function clubSlug(name: string): string {
  return slugify(name.trim())
}

export function isClubStepFilled(draft: OnboardingDraft): boolean {
  return (
    draft.clubName.trim().length > 0 &&
    draft.venue.trim().length > 0 &&
    clubSlug(draft.clubName).length > 0
  )
}

export function isSportStepFilled(draft: OnboardingDraft): boolean {
  return draft.maxPlayers >= 2
}

export function getScheduleIssue(draft: OnboardingDraft): ScheduleIssue | null {
  if (!draft.matchDate) return 'requiredFields'
  const seasonStartsAt = parseCalendarDate(draft.seasonStartsAt)
  const seasonEndsAt = parseCalendarDate(draft.seasonEndsAt)
  const matchDate = parseCalendarDate(draft.matchDate)
  if (isCalendarEndBeforeStart(seasonStartsAt, seasonEndsAt)) return 'seasonEndBeforeStart'
  if (isMatchDateOutsideSeason(matchDate, seasonStartsAt, seasonEndsAt)) return 'matchOutsideSeason'
  return null
}

export function isScheduleStepFilled(draft: OnboardingDraft): boolean {
  return getScheduleIssue(draft) === null
}

/** A later step can be opened when every earlier step already has valid answers. */
export function isOnboardingStepReachable(draft: OnboardingDraft, target: number): boolean {
  if (target <= 1) return true
  if (!isClubStepFilled(draft)) return false
  if (target >= 3 && !isSportStepFilled(draft)) return false
  if (target >= 4 && !isScheduleStepFilled(draft)) return false
  return target <= 4
}

export function clampOnboardingStep(draft: OnboardingDraft, requested: number): number {
  const target = Math.min(4, Math.max(1, Math.trunc(requested)))
  for (let step = target; step > 1; step -= 1) {
    if (isOnboardingStepReachable(draft, step)) return step
  }
  return 1
}

export function parseOnboardingDraft(value: unknown): OnboardingDraft | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const defaults = createDefaultOnboardingDraft()
  const sportType = isSportType(raw.sportType) ? raw.sportType : defaults.sportType
  const maxPlayers =
    typeof raw.maxPlayers === 'number' && Number.isFinite(raw.maxPlayers)
      ? raw.maxPlayers
      : defaults.maxPlayers
  const seasonStartsAt = isDateString(raw.seasonStartsAt)
    ? raw.seasonStartsAt
    : defaults.seasonStartsAt
  const seasonEndsAt = isDateString(raw.seasonEndsAt) ? raw.seasonEndsAt : defaults.seasonEndsAt
  const matchDate =
    raw.matchDate === null ? null : isDateString(raw.matchDate) ? raw.matchDate : defaults.matchDate
  const matchTime =
    typeof raw.matchTime === 'string' && /^\d{2}:\d{2}$/.test(raw.matchTime)
      ? raw.matchTime
      : defaults.matchTime
  const clubName = readString(raw.clubName, '')
  const confirmedSlug = readNullableString(raw.confirmedSlug)
  const slug = clubSlug(clubName)

  const draft: OnboardingDraft = {
    step: 1,
    clubName,
    venue: readString(raw.venue, ''),
    sportType,
    maxPlayers,
    seasonStartsAt,
    seasonEndsAt,
    matchDate,
    matchTime,
    recurrence: isRecurrence(raw.recurrence) ? raw.recurrence : defaults.recurrence,
    emails: readStringList(raw.emails),
    confirmedSlug: confirmedSlug === slug ? confirmedSlug : null,
    createdClubId: readNullableString(raw.createdClubId),
    createdSlug: readNullableString(raw.createdSlug),
    createdName: readNullableString(raw.createdName),
    createdSeasonId: readNullableString(raw.createdSeasonId),
    matchesCreated: raw.matchesCreated === true,
    invitedEmails: readStringList(raw.invitedEmails),
  }

  const requestedStep = typeof raw.step === 'number' ? raw.step : 1
  draft.step = clampOnboardingStep(draft, requestedStep)
  return draft
}

export function readOnboardingDraft(
  storage: DraftStorage | null = browserStorage(),
): OnboardingDraft | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseOnboardingDraft(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

export function writeOnboardingDraft(
  draft: OnboardingDraft,
  storage: DraftStorage | null = browserStorage(),
): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // A blocked or full store should not stop the form for this visit.
  }
}

export function clearOnboardingDraft(storage: DraftStorage | null = browserStorage()): void {
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // Same as write: the in-memory form still finishes.
  }
}

export function isOrganizationNameTaken(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'ORGANIZATION_SLUG_ALREADY_TAKEN' ||
    error.code === 'ORGANIZATION_ALREADY_EXISTS' ||
    error.message === 'Organization slug already taken' ||
    error.message === 'Organization already exists'
  )
}

export function isAlreadyInvited(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION' ||
    error.message === 'User is already invited to this organization'
  )
}
