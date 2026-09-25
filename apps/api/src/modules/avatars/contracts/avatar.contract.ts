import { z } from 'zod'

export const avatarSchema = z
  .object({
    image: z.string().nullable(),
  })
  .meta({
    title: 'AvatarSchema',
    description: 'Public URL of the current avatar, or null when the avatar was removed',
  })

export type AvatarDto = z.infer<typeof avatarSchema>
