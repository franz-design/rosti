import { Button } from '@rosti/ui/components/primitives/button'
import { Slider } from '@rosti/ui/components/primitives/slider'
import { toast } from '@rosti/ui/components/primitives/sonner'
import { useIsMobile } from '@rosti/ui/hooks/use-mobile'
import { cn } from '@rosti/ui/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TFunction } from 'i18next'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClub } from '@/features/clubs/hooks/club-context'
import { authClient } from '@/lib/auth-client'
import {
  rostiApi,
  type PlayerDetail,
  type PlayerSkillKey,
  type PlayerSkillRatings,
} from '@/lib/rosti-api'
import { fetchPlayerDetailQueryOptions } from '../utils/players-queries'

const SKILL_LABEL_KEYS = {
  football: {
    defense: 'playerSkills.sports.football.defense',
    attack: 'playerSkills.sports.football.attack',
    passing: 'playerSkills.sports.football.passing',
    shooting: 'playerSkills.sports.football.shooting',
    vision: 'playerSkills.sports.football.vision',
    endurance: 'playerSkills.sports.football.endurance',
    physical: 'playerSkills.sports.football.physical',
    goalkeeping: 'playerSkills.sports.football.goalkeeping',
  },
  futsal: {
    defense: 'playerSkills.sports.futsal.defense',
    attack: 'playerSkills.sports.futsal.attack',
    passing: 'playerSkills.sports.futsal.passing',
    shooting: 'playerSkills.sports.futsal.shooting',
    vision: 'playerSkills.sports.futsal.vision',
    endurance: 'playerSkills.sports.futsal.endurance',
    physical: 'playerSkills.sports.futsal.physical',
    goalkeeping: 'playerSkills.sports.futsal.goalkeeping',
  },
  basketball: {
    shooting: 'playerSkills.sports.basketball.shooting',
    passing: 'playerSkills.sports.basketball.passing',
    dribbling: 'playerSkills.sports.basketball.dribbling',
    defense: 'playerSkills.sports.basketball.defense',
    rebounding: 'playerSkills.sports.basketball.rebounding',
    speed: 'playerSkills.sports.basketball.speed',
    vision: 'playerSkills.sports.basketball.vision',
    physical: 'playerSkills.sports.basketball.physical',
  },
  volleyball: {
    serve: 'playerSkills.sports.volleyball.serve',
    reception: 'playerSkills.sports.volleyball.reception',
    setting: 'playerSkills.sports.volleyball.setting',
    attack: 'playerSkills.sports.volleyball.attack',
    block: 'playerSkills.sports.volleyball.block',
    defense: 'playerSkills.sports.volleyball.defense',
    positioning: 'playerSkills.sports.volleyball.positioning',
    reading: 'playerSkills.sports.volleyball.reading',
  },
  tennis: {
    serve: 'playerSkills.sports.tennis.serve',
    forehand: 'playerSkills.sports.tennis.forehand',
    backhand: 'playerSkills.sports.tennis.backhand',
    volley: 'playerSkills.sports.tennis.volley',
    smash: 'playerSkills.sports.tennis.smash',
    footwork: 'playerSkills.sports.tennis.footwork',
    endurance: 'playerSkills.sports.tennis.endurance',
    consistency: 'playerSkills.sports.tennis.consistency',
  },
  padel: {
    serve: 'playerSkills.sports.padel.serve',
    forehand: 'playerSkills.sports.padel.forehand',
    backhand: 'playerSkills.sports.padel.backhand',
    volley: 'playerSkills.sports.padel.volley',
    smash: 'playerSkills.sports.padel.smash',
    bandeja: 'playerSkills.sports.padel.bandeja',
    defense: 'playerSkills.sports.padel.defense',
    walls: 'playerSkills.sports.padel.walls',
  },
  badminton: {
    serve: 'playerSkills.sports.badminton.serve',
    clear: 'playerSkills.sports.badminton.clear',
    drop: 'playerSkills.sports.badminton.drop',
    smash: 'playerSkills.sports.badminton.smash',
    netPlay: 'playerSkills.sports.badminton.netPlay',
    defense: 'playerSkills.sports.badminton.defense',
    footwork: 'playerSkills.sports.badminton.footwork',
    endurance: 'playerSkills.sports.badminton.endurance',
  },
} as const

type RatedSport = keyof typeof SKILL_LABEL_KEYS

type SkillLabelKey = {
  [Sport in RatedSport]: (typeof SKILL_LABEL_KEYS)[Sport][keyof (typeof SKILL_LABEL_KEYS)[Sport]]
}[RatedSport]

interface PlayerSkillRatingsSectionProps {
  organizationId: string
  playerUserId: string
  ratings: PlayerSkillRatings
}

export function PlayerSkillRatingsSection({
  organizationId,
  playerUserId,
  ratings,
}: PlayerSkillRatingsSectionProps) {
  const { t } = useTranslation()
  const { isClubAdmin, isMembershipLoading } = useClub()
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [isEditing, setIsEditing] = useState(false)
  const [resetNonce, setResetNonce] = useState(0)
  const drafts = useRef(new Map<PlayerSkillKey, number>())
  const isEditingRef = useRef(isEditing)
  const isSelf = session?.user?.id === playerUserId
  const canEdit = isSelf || (isClubAdmin && !isMembershipLoading)
  const isMobileLocked = isMobile && !isEditing
  isEditingRef.current = isEditing

  useEffect(() => {
    if (isMobile || !isEditing) return
    setIsEditing(false)
    setResetNonce((nonce) => nonce + 1)
    drafts.current.clear()
  }, [isMobile, isEditing])

  const save = useMutation({
    mutationFn: (skills: Array<{ key: PlayerSkillKey; value: number }>) =>
      rostiApi.updatePlayerSkills(organizationId, playerUserId, skills),
    onSuccess: (nextRatings) => {
      queryClient.setQueryData<PlayerDetail>(
        fetchPlayerDetailQueryOptions(organizationId, playerUserId).queryKey,
        (current) => {
          if (!current) return current
          return { ...current, skillRatings: nextRatings }
        },
      )
      setIsEditing(false)
      drafts.current.clear()
    },
    onError: () => {
      toast.error(t('playerSkills.saveError'))
      if (!isEditingRef.current) setResetNonce((nonce) => nonce + 1)
    },
  })

  function handleStartEditing() {
    drafts.current.clear()
    setIsEditing(true)
  }

  function handleDraftChange(key: PlayerSkillKey, value: number) {
    drafts.current.set(key, value)
  }

  function handleSave() {
    if (save.isPending) return
    const changed = ratings.skills.flatMap((skill) => {
      const value = drafts.current.get(skill.key)
      if (value === undefined || value === skill.value) return []
      return [{ key: skill.key, value }]
    })
    if (changed.length === 0) {
      setIsEditing(false)
      drafts.current.clear()
      return
    }
    save.mutate(changed)
  }

  function renderSaveButton() {
    return (
      <Button type="button" className="w-full" loading={save.isPending} onClick={handleSave}>
        {t('playerSkills.save')}
      </Button>
    )
  }

  return (
    <section className="w-full px-4 sm:px-0 lg:w-1/2">
      <h2 className="text-lg font-medium">{t('playerSkills.title')}</h2>
      {canEdit ? (
        <div className="mt-4 md:hidden">
          {isEditing ? (
            renderSaveButton()
          ) : (
            <Button type="button" variant="outline" className="w-full" onClick={handleStartEditing}>
              {t('playerSkills.edit')}
            </Button>
          )}
        </div>
      ) : null}
      <div className="mt-6 flex flex-col gap-10">
        {ratings.skills.map((skill) => (
          <SkillSlider
            key={skill.key}
            label={skillLabel(t, ratings.sportType, skill.key)}
            skillKey={skill.key}
            savedValue={skill.value}
            resetNonce={resetNonce}
            disabled={!canEdit || isMobileLocked || (isEditing && save.isPending)}
            locked={!isEditing}
            preserveOpacity={canEdit && isMobileLocked}
            deferCommit={isEditing}
            onDraftChange={handleDraftChange}
            onCommit={(key, value) => save.mutate([{ key, value }])}
          />
        ))}
      </div>
      {canEdit && isEditing ? <div className="mt-8 md:hidden">{renderSaveButton()}</div> : null}
    </section>
  )
}

interface SkillSliderProps {
  label: string
  skillKey: PlayerSkillKey
  savedValue: number
  resetNonce: number
  disabled: boolean
  locked: boolean
  preserveOpacity: boolean
  deferCommit: boolean
  onDraftChange: (key: PlayerSkillKey, value: number) => void
  onCommit: (key: PlayerSkillKey, value: number) => void
}

function SkillSlider({
  label,
  skillKey,
  savedValue,
  resetNonce,
  disabled,
  locked,
  preserveOpacity,
  deferCommit,
  onDraftChange,
  onCommit,
}: SkillSliderProps) {
  const [value, setValue] = useState(savedValue)

  useEffect(() => {
    setValue(savedValue)
  }, [savedValue, resetNonce])

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Slider
        value={value}
        min={0}
        max={10}
        step={1}
        largeStep={1}
        disabled={disabled}
        aria-label={label}
        className={cn(
          locked && 'max-md:pointer-events-none',
          preserveOpacity && 'aria-disabled:opacity-100',
        )}
        onValueChange={(next) => {
          setValue(next)
          if (deferCommit) onDraftChange(skillKey, next)
        }}
        onValueCommitted={(next) => {
          if (deferCommit) {
            onDraftChange(skillKey, next)
            return
          }
          if (disabled || next === savedValue) return
          onCommit(skillKey, next)
        }}
      />
    </div>
  )
}

function skillLabel(
  t: TFunction,
  sportType: PlayerSkillRatings['sportType'],
  key: PlayerSkillKey,
): string {
  if (!isRatedSport(sportType)) return key
  const labels: Partial<Record<PlayerSkillKey, SkillLabelKey>> = SKILL_LABEL_KEYS[sportType]
  const labelKey = labels[key]
  if (!labelKey) return key
  return t(labelKey)
}

function isRatedSport(sportType: string): sportType is RatedSport {
  return sportType in SKILL_LABEL_KEYS
}
