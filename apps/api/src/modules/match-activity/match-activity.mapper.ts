import { User } from '../auth/entities/user.entity'
import { MatchActivityDto, MatchActivityEntry } from './match-activity.contract'
import { MatchActivity } from './match-activity.entity'

function toPerson(user: User | null | undefined): MatchActivityDto['actor'] {
  if (!user) return null
  return { id: user.id, name: user.name, image: user.image }
}

export function toMatchActivityDto(activity: MatchActivity): MatchActivityDto {
  const entry = { action: activity.action, details: activity.details } as MatchActivityEntry
  return {
    id: activity.id,
    matchId: activity.match.id,
    area: activity.area,
    createdAt: activity.createdAt,
    actor: toPerson(activity.actor),
    subject: toPerson(activity.subject),
    ...entry,
  }
}
