import { TypedBody, TypedController, TypedParam, TypedRoute } from '@lonestone/nzoth/server'
import { UseGuards } from '@nestjs/common'
import { z } from 'zod'
import { LoggedInBetterAuthSession } from '../auth/auth.config'
import { Session } from '../auth/auth.decorator'
import { AuthGuard } from '../auth/auth.guard'
import {
  notificationPreferenceSchema,
  RegisterDeviceInput,
  RegisterWebPushInput,
  registerDeviceSchema,
  registerWebPushSchema,
  removeWebPushResultSchema,
  UpdateNotificationPreferenceInput,
  updateNotificationPreferenceSchema,
  webPushPublicKeySchema,
  webPushSubscriptionSchema,
} from './contracts/notification.contract'
import { NotificationService } from './notification.service'

@TypedController('notifications', undefined, { tags: ['Notifications'] })
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @TypedRoute.Get('preferences', notificationPreferenceSchema)
  async getPreferences(@Session() session: LoggedInBetterAuthSession) {
    const prefs = await this.notificationService.getOrCreatePreferences(session.user.id)
    return {
      id: prefs.id,
      emailEnabled: prefs.emailEnabled,
      pushEnabled: prefs.pushEnabled,
      notifyNewMatch: prefs.notifyNewMatch,
      notifyRsvpReminder: prefs.notifyRsvpReminder,
      notifyMatchCancelled: prefs.notifyMatchCancelled,
      notifyChatMention: prefs.notifyChatMention,
      notifyAllChatMessages: prefs.notifyAllChatMessages,
      notifyPlayerVote: prefs.notifyPlayerVote,
      notifyFeeRequest: prefs.notifyFeeRequest,
    }
  }

  @TypedRoute.Put('preferences', notificationPreferenceSchema)
  async updatePreferences(
    @Session() session: LoggedInBetterAuthSession,
    @TypedBody(updateNotificationPreferenceSchema) body: UpdateNotificationPreferenceInput,
  ) {
    const prefs = await this.notificationService.updatePreferences(session.user.id, body)
    return {
      id: prefs.id,
      emailEnabled: prefs.emailEnabled,
      pushEnabled: prefs.pushEnabled,
      notifyNewMatch: prefs.notifyNewMatch,
      notifyRsvpReminder: prefs.notifyRsvpReminder,
      notifyMatchCancelled: prefs.notifyMatchCancelled,
      notifyChatMention: prefs.notifyChatMention,
      notifyAllChatMessages: prefs.notifyAllChatMessages,
      notifyPlayerVote: prefs.notifyPlayerVote,
      notifyFeeRequest: prefs.notifyFeeRequest,
    }
  }

  @TypedRoute.Post('devices')
  async registerDevice(
    @Session() session: LoggedInBetterAuthSession,
    @TypedBody(registerDeviceSchema) body: RegisterDeviceInput,
  ) {
    const device = await this.notificationService.registerDevice(
      session.user.id,
      body.token,
      body.platform,
    )
    return { id: device.id, platform: device.platform }
  }

  @TypedRoute.Get('web-push/public-key', webPushPublicKeySchema)
  getWebPushPublicKey() {
    return { publicKey: this.notificationService.getWebPushPublicKey() }
  }

  @TypedRoute.Post('web-push', webPushSubscriptionSchema)
  async registerWebPush(
    @Session() session: LoggedInBetterAuthSession,
    @TypedBody(registerWebPushSchema) body: RegisterWebPushInput,
  ) {
    const device = await this.notificationService.registerWebPush(session.user.id, body)
    return { id: device.id, installationId: body.installationId }
  }

  @TypedRoute.Delete('web-push/:installationId', removeWebPushResultSchema)
  async removeWebPush(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('installationId', z.string().uuid()) installationId: string,
  ) {
    const removed = await this.notificationService.removeWebPush(session.user.id, installationId)
    return { removed }
  }
}
