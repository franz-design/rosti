import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { EntityManager } from '@mikro-orm/core'
import { User } from '../modules/auth/auth.entity'
import { AvatarService } from '../modules/avatars/avatar.service'

const SEED_AVATAR_COUNT = 16

export async function assignSeedAvatar(
  em: EntityManager,
  user: User,
  index: number,
): Promise<void> {
  if (index < 0 || index >= SEED_AVATAR_COUNT) {
    throw new Error(`Seed avatar index ${index} is out of range`)
  }

  const fileName = `${String(index + 1).padStart(2, '0')}.jpg`
  const buffer = await readFile(join(process.cwd(), 'src/seeders/avatars', fileName))
  await new AvatarService(em).save(user.id, buffer)
}
