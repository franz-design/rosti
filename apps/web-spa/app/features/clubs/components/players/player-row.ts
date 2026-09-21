import type { ClubMember } from '@/lib/rosti-api'

export type PlayerRow =
  | {
      kind: 'member'
      id: string
      email: string
      name: string
      role: ClubMember['role']
      canRemove: boolean
      canChangeRole: boolean
    }
  | {
      kind: 'invitation'
      id: string
      email: string
      name: string
      canRemove: boolean
    }
