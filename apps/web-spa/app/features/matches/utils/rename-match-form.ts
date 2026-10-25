import { z } from 'zod'

export const renameMatchScopes = ['match', 'following'] as const

export type RenameMatchScope = (typeof renameMatchScopes)[number]

export interface RenameMatchFormValues {
  title: string
  scope: RenameMatchScope
}

interface RenameMatchFormMessages {
  titleRequired: string
}

export function createRenameMatchFormSchema(messages: RenameMatchFormMessages) {
  return z.object({
    title: z.string().trim().min(1, messages.titleRequired),
    scope: z.enum(renameMatchScopes),
  })
}
