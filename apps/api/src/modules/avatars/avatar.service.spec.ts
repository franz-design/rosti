import { readFile, rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { EntityManager } from '@mikro-orm/core'
import { BadRequestException } from '@nestjs/common'
import sharp from 'sharp'
import { config } from '../../config/env.config'
import { AVATAR_MAX_BYTES, AVATAR_MAX_WIDTH_PX, AVATAR_TOO_LARGE_MESSAGE } from './avatar.constants'
import { AvatarService } from './avatar.service'

const fixturesDir = resolve(process.cwd(), 'src/modules/avatars/fixtures')

const userId = '6f1b7c3a-2d4e-4f8a-9b1c-0a2b3c4d5e6f'
const smallUserId = '7a2c8d4b-3e5f-4a9b-8c2d-1b3c4d5e6f70'
const heicUserId = '8b3d9e5c-4f60-4b0c-9d3e-2c4d5e6f7081'
const rotatedUserId = '9c4e0f6d-5071-4c1d-ae4f-3d5e6f708192'
const removedUserId = 'ad5f107e-6182-4d2e-bf50-4e6f708192a3'

describe.sequential('avatarService', () => {
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

  it('shrinks a wide image to 512 pixels and keeps its proportions', async () => {
    const png = await sharp({
      create: {
        width: 1000,
        height: 500,
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
    expect(stored.width).toBe(AVATAR_MAX_WIDTH_PX)
    expect(stored.height).toBe(256)
    expect(await stat(`${config.avatars.storageDir}/${userId}.webp`)).toBeTruthy()
  })

  it('does not enlarge an image that is already narrower than 512 pixels', async () => {
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

    await service.save(smallUserId, png)

    const stored = await sharp(`${config.avatars.storageDir}/${smallUserId}.webp`).metadata()
    expect(stored.width).toBe(40)
    expect(stored.height).toBe(20)
  })

  it('stores a heic photo as a webp no wider than 512 pixels', async () => {
    const heic = await readFile(resolve(fixturesDir, 'wide.heic'))

    await service.save(heicUserId, heic)

    const stored = await sharp(`${config.avatars.storageDir}/${heicUserId}.webp`).metadata()
    expect(stored.format).toBe('webp')
    expect(stored.width).toBe(AVATAR_MAX_WIDTH_PX)
    expect(stored.height).toBe(256)
  })

  it('applies heic orientation before sizing', async () => {
    const heic = await readFile(resolve(fixturesDir, 'rotated.heic'))

    await service.save(rotatedUserId, heic)

    const stored = await sharp(`${config.avatars.storageDir}/${rotatedUserId}.webp`).metadata()
    expect(stored.width).toBe(40)
    expect(stored.height).toBe(80)
  })

  it('rejects a file that is not a jpeg, png, webp, or heic', async () => {
    await expect(service.save(userId, Buffer.from('not an image'))).rejects.toBeInstanceOf(
      BadRequestException,
    )
    expect(em.flush).not.toHaveBeenCalled()
  })

  it('rejects a file larger than 6 MB', async () => {
    await expect(service.save(userId, Buffer.alloc(AVATAR_MAX_BYTES + 1))).rejects.toThrow(
      AVATAR_TOO_LARGE_MESSAGE,
    )
  })

  it('clears the url and deletes the file', async () => {
    const png = await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .png()
      .toBuffer()
    await service.save(removedUserId, png)

    const saved = await service.remove(removedUserId)

    expect(saved.image).toBeNull()
    await expect(stat(`${config.avatars.storageDir}/${removedUserId}.webp`)).rejects.toThrow()
  })
})
