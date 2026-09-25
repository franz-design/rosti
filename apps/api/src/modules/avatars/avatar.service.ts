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
import sharp from 'sharp'
import { z } from 'zod'
import { config } from '../../config/env.config'
import { User } from '../auth/auth.entity'
import { AVATAR_MAX_BYTES, AVATAR_SIZE_PX, AVATAR_URL_MAX_LENGTH } from './avatar.constants'

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp'])

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
      throw new BadRequestException('Avatar must be 2 MB or smaller')
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
      const image = sharp(buffer, {
        limitInputPixels: 16_777_216,
        animated: false,
        failOn: 'error',
      })
      const metadata = await image.metadata()
      if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
        throw new BadRequestException('Avatar must be a JPEG, PNG, or WebP image')
      }
      return await image
        .rotate()
        .resize(AVATAR_SIZE_PX, AVATAR_SIZE_PX, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toBuffer()
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new BadRequestException('Avatar must be a JPEG, PNG, or WebP image')
    }
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
