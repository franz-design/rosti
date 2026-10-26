import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import type { Response } from 'express'
import { Catch } from '@nestjs/common'
import { MulterError } from 'multer'
import { AVATAR_TOO_LARGE_MESSAGE } from './avatar.constants'

@Catch(MulterError)
export class AvatarUploadExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const message =
      exception.code === 'LIMIT_FILE_SIZE'
        ? AVATAR_TOO_LARGE_MESSAGE
        : 'Could not read the uploaded image'
    response.status(400).json({ message })
  }
}
