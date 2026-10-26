import { randomUUID } from 'node:crypto'
import { createReadStream, type ReadStream } from 'node:fs'
import { mkdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { EntityManager } from '@mikro-orm/core'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import decodeHeic from 'heic-decode'
import sharp, { type Sharp } from 'sharp'
import { z } from 'zod'
import { config } from '../../config/env.config'
import { User } from '../auth/auth.entity'
import {
  AVATAR_INVALID_TYPE_MESSAGE,
  AVATAR_MAX_BYTES,
  AVATAR_MAX_INPUT_PIXELS,
  AVATAR_MAX_WIDTH_PX,
  AVATAR_TOO_LARGE_MESSAGE,
  AVATAR_URL_MAX_LENGTH,
} from './avatar.constants'

const SHARP_FORMATS = new Set(['jpeg', 'png', 'webp'])
const HEIC_BRANDS = new Set(['mif1', 'msf1', 'heic', 'heix', 'hevc', 'hevx'])

@Injectable()
export class AvatarService implements OnModuleInit {
  private readonly storageDir = config.avatars.storageDir

  constructor(private readonly em: EntityManager) {}

  async onModuleInit(): Promise<void> {
    await mkdir(this.storageDir, { recursive: true })
  }

  async save(userId: string, buffer: Buffer): Promise<User> {
    this.assertUserId(userId)
    if (buffer.length === 0) {
      throw new BadRequestException('Choose an image file')
    }
    if (buffer.length > AVATAR_MAX_BYTES) {
      throw new BadRequestException(AVATAR_TOO_LARGE_MESSAGE)
    }

    const webp = await this.toWebp(buffer)
    const imageUrl = this.buildUrl(userId, Date.now())
    await this.writeAtomic(userId, webp)

    try {
      const user = await this.em.findOneOrFail(User, { id: userId })
      user.image = imageUrl
      await this.em.flush()
      return user
    } catch (error) {
      await rm(this.filePath(userId), { force: true })
      throw error
    }
  }

  async remove(userId: string): Promise<User> {
    this.assertUserId(userId)
    const user = await this.em.findOneOrFail(User, { id: userId })
    user.image = null
    await this.em.flush()
    await rm(this.filePath(userId), { force: true })
    return user
  }

  open(userId: string): ReadStream {
    this.assertUserId(userId)
    return createReadStream(this.filePath(userId))
  }

  async assertStored(userId: string): Promise<void> {
    this.assertUserId(userId)
    try {
      const file = await stat(this.filePath(userId))
      if (!file.isFile()) throw new NotFoundException('Avatar not found')
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      throw new NotFoundException('Avatar not found')
    }
  }

  private async toWebp(buffer: Buffer): Promise<Buffer> {
    try {
      const image = await this.openImage(buffer)
      return await image
        .rotate()
        .resize({ width: AVATAR_MAX_WIDTH_PX, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException(AVATAR_INVALID_TYPE_MESSAGE)
    }
  }

  private async openImage(buffer: Buffer): Promise<Sharp> {
    if (this.isHeic(buffer)) return this.openHeic(buffer)

    const image = sharp(buffer, {
      limitInputPixels: AVATAR_MAX_INPUT_PIXELS,
      animated: false,
      failOn: 'error',
    })
    const metadata = await image.metadata()
    if (!metadata.format || !SHARP_FORMATS.has(metadata.format)) {
      throw new BadRequestException(AVATAR_INVALID_TYPE_MESSAGE)
    }
    return image
  }

  // Sharp's bundled libvips cannot decode HEVC, which is what HEIC photos use.
  private async openHeic(buffer: Buffer): Promise<Sharp> {
    let images: Awaited<ReturnType<typeof decodeHeic.all>>
    try {
      images = await decodeHeic.all({ buffer })
    } catch {
      throw new BadRequestException(AVATAR_INVALID_TYPE_MESSAGE)
    }

    try {
      const primary = images[0]
      if (!primary || primary.width < 1 || primary.height < 1) {
        throw new BadRequestException(AVATAR_INVALID_TYPE_MESSAGE)
      }
      if (primary.width * primary.height > AVATAR_MAX_INPUT_PIXELS) {
        throw new BadRequestException(AVATAR_INVALID_TYPE_MESSAGE)
      }
      const decoded = await primary.decode()
      return sharp(decoded.data, {
        raw: {
          width: decoded.width,
          height: decoded.height,
          channels: 4,
        },
        limitInputPixels: AVATAR_MAX_INPUT_PIXELS,
      })
    } finally {
      images.dispose()
    }
  }

  private isHeic(buffer: Buffer): boolean {
    if (buffer.length < 12) return false
    const brand = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11])
      .replace('\0', ' ')
      .trim()
    return HEIC_BRANDS.has(brand)
  }

  private buildUrl(userId: string, version: number): string {
    const imageUrl = `${config.api.baseUrl}/api/avatars/${userId}?v=${version}`
    if (imageUrl.length > AVATAR_URL_MAX_LENGTH) {
      throw new InternalServerErrorException('Avatar URL is too long to store')
    }
    return imageUrl
  }

  private async writeAtomic(userId: string, contents: Buffer): Promise<void> {
    await mkdir(this.storageDir, { recursive: true })
    const destination = this.filePath(userId)
    const temporary = `${destination}.${randomUUID()}.tmp`
    await writeFile(temporary, contents)
    await rename(temporary, destination)
  }

  private filePath(userId: string): string {
    return join(this.storageDir, `${userId}.webp`)
  }

  private assertUserId(userId: string): void {
    if (!z.string().uuid().safeParse(userId).success) {
      throw new NotFoundException('Avatar not found')
    }
  }
}
