import { rm, stat } from 'node:fs/promises'
import { EntityManager } from '@mikro-orm/core'
import { BadRequestException } from '@nestjs/common'
import sharp from 'sharp'
import { config } from '../../config/env.config'
import { AvatarService } from './avatar.service'

const userId = '6f1b7c3a-2d4e-4f8a-9b1c-0a2b3c4d5e6f'

describe('avatarService', () => {
  const user = { id: userId, image: null as string | null }
  const em = {
    findOneOrFail: vi.fn().mockResolvedValue(user),
    flush: vi.fn().mockResolvedValue(undefined),
  } as unknown as EntityManager

  const service = new AvatarService(em)

  beforeEach(() => {
    user.image = null
    vi.mocked(em.findOneOrFail).mockClear()
    vi.mocked(em.flush).mockClear()
  })

  afterAll(async () => {
    await rm(config.avatars.storageDir, { recursive: true, force: true })
  })

  it('stores a square webp and saves its public url', async () => {
    const png = await sharp({
      create: {
        width: 40,
        height: 20,
        channels: 3,
        background: { r: 20, g: 80, b: 160 },
      },
    })
      .png()
      .toBuffer()

    const saved = await service.save(userId, png)

    expect(saved.image).toContain(`/api/avatars/${userId}?v=`)
    const stored = await sharp(`${config.avatars.storageDir}/${userId}.webp`).metadata()
    expect(stored.format).toBe('webp')
    expect(stored.width).toBe(256)
    expect(stored.height).toBe(256)
    expect(await stat(`${config.avatars.storageDir}/${userId}.webp`)).toBeTruthy()
  })

  it('rejects a file that is not a jpeg, png, or webp', async () => {
    await expect(service.save(userId, Buffer.from('not an image'))).rejects.toBeInstanceOf(
      BadRequestException,
    )
    expect(em.flush).not.toHaveBeenCalled()
  })

  it('rejects a file larger than 2 MB', async () => {
    await expect(service.save(userId, Buffer.alloc(2 * 1024 * 1024 + 1))).rejects.toBeInstanceOf(
      BadRequestException,
    )
  })

  it('clears the url and deletes the file', async () => {
    const png = await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .png()
      .toBuffer()
    await service.save(userId, png)

    const saved = await service.remove(userId)

    expect(saved.image).toBeNull()
    await expect(stat(`${config.avatars.storageDir}/${userId}.webp`)).rejects.toThrow()
  })
})
