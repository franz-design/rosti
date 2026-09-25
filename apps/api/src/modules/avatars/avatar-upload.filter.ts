import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import type { Response } from 'express'
import { Catch } from '@nestjs/common'
import { MulterError } from 'multer'

@Catch(MulterError)
export class AvatarUploadExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const message =
      exception.code === 'LIMIT_FILE_SIZE'
        ? 'Avatar must be 2 MB or smaller'
        : 'Could not read the uploaded image'
    response.status(400).json({ message })
  }
}
