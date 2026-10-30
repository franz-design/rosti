import type { SportType } from '../../../lib/rosti-api'
import { slugify } from './slugify'

const STORAGE_KEY = 'rosti.onboarding.draft'
const LAST_STEP = 2

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

export interface OnboardingDraft {
  step: number
  clubName: string
  venue: string
  sportType: SportType
  maxPlayers: number
  confirmedSlug: string | null
  createdClubId: string | null
  createdSlug: string | null
  createdName: string | null
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

export function createDefaultOnboardingDraft(): OnboardingDraft {
  return {
    step: 1,
    clubName: '',
    venue: '',
    sportType: 'football',
    maxPlayers: 10,
    confirmedSlug: null,
    createdClubId: null,
    createdSlug: null,
    createdName: null,
  }
}

function isSportType(value: unknown): value is SportType {
  return typeof value === 'string' && SPORT_TYPES.includes(value as SportType)
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
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

/** A later step can be opened when every earlier step already has valid answers. */
export function isOnboardingStepReachable(draft: OnboardingDraft, target: number): boolean {
  if (target <= 1) return true
  if (target > LAST_STEP) return false
  return isClubStepFilled(draft)
}

export function clampOnboardingStep(draft: OnboardingDraft, requested: number): number {
  const target = Math.min(LAST_STEP, Math.max(1, Math.trunc(requested)))
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
  const clubName = readString(raw.clubName, '')
  const confirmedSlug = readNullableString(raw.confirmedSlug)
  const slug = clubSlug(clubName)

  const draft: OnboardingDraft = {
    step: 1,
    clubName,
    venue: readString(raw.venue, ''),
    sportType,
    maxPlayers,
    confirmedSlug: confirmedSlug === slug ? confirmedSlug : null,
    createdClubId: readNullableString(raw.createdClubId),
    createdSlug: readNullableString(raw.createdSlug),
    createdName: readNullableString(raw.createdName),
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
