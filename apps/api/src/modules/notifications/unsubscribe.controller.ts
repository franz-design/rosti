import { Controller, Get, Header, Post, Query } from '@nestjs/common'
import { config } from '../../config/env.config'
import { renderUnsubscribePage } from '../email/unsubscribe-page'
import { readUnsubscribeToken } from '../email/unsubscribe-token'
import { NotificationService } from './notification.service'

@Controller('notifications')
export class UnsubscribeController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('unsubscribe')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  showUnsubscribe(@Query('token') token = ''): string {
    const userId = readUnsubscribeToken(token, config.betterAuth.secret)
    if (!userId) return renderUnsubscribePage({ kind: 'invalid' })
    return renderUnsubscribePage({ kind: 'confirm', token })
  }

  @Post('unsubscribe')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  unsubscribe(@Query('token') token = ''): Promise<string> {
    return this.notificationService.unsubscribeByToken(token)
  }
}
