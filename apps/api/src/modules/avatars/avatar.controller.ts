import { TypedController, TypedRoute } from '@lonestone/nzoth/server'
import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Param,
  StreamableFile,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { LoggedInBetterAuthSession } from '../auth/auth.config'
import { Session } from '../auth/auth.decorator'
import { AuthGuard } from '../auth/auth.guard'
import { AvatarUploadExceptionFilter } from './avatar-upload.filter'
import { AVATAR_MAX_BYTES } from './avatar.constants'
import { AvatarService } from './avatar.service'
import { AvatarDto, avatarSchema } from './contracts/avatar.contract'

interface UploadedAvatar {
  buffer: Buffer
  size: number
}

@TypedController('me/avatar', undefined, { tags: ['Avatar'] })
@UseGuards(AuthGuard)
@UseFilters(AvatarUploadExceptionFilter)
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @TypedRoute.Put('', avatarSchema)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
    }),
  )
  async upload(
    @Session() session: LoggedInBetterAuthSession,
    @UploadedFile() file: UploadedAvatar | undefined,
  ): Promise<AvatarDto> {
    if (!file || file.size === 0) {
      throw new BadRequestException('Choose an image file')
    }
    const user = await this.avatarService.save(session.user.id, file.buffer)
    return { image: user.image }
  }

  @TypedRoute.Delete('', avatarSchema)
  async remove(@Session() session: LoggedInBetterAuthSession): Promise<AvatarDto> {
    const user = await this.avatarService.remove(session.user.id)
    return { image: user.image }
  }
}

@Controller('avatars')
export class AvatarFileController {
  constructor(private readonly avatarService: AvatarService) {}

  @Get(':userId')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async get(@Param('userId') userId: string): Promise<StreamableFile> {
    await this.avatarService.assertStored(userId)
    return new StreamableFile(this.avatarService.open(userId), {
      type: 'image/webp',
      disposition: 'inline',
    })
  }
}
