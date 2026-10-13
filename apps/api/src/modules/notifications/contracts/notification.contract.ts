import { z } from 'zod'

export enum DevicePlatform {
  Ios = 'ios',
  Android = 'android',
  Web = 'web',
}

export enum ScheduledJobType {
  MatchInvite = 'match_invite',
  RsvpReminder = 'rsvp_reminder',
  ScoreReminder = 'score_reminder',
  FeeRequest = 'fee_request',
  FeeReminder = 'fee_reminder',
}

export enum ScheduledJobStatus {
  Pending = 'pending',
  Done = 'done',
  Cancelled = 'cancelled',
  Failed = 'failed',
}

export const notificationPreferenceSchema = z
  .object({
    id: z.string().uuid(),
    emailEnabled: z.boolean(),
    pushEnabled: z.boolean(),
    notifyNewMatch: z.boolean(),
    notifyRsvpReminder: z.boolean(),
    notifyMatchCancelled: z.boolean(),
    notifyChatMention: z.boolean(),
    notifyAllChatMessages: z.boolean(),
    notifyPlayerVote: z.boolean(),
    notifyFeeRequest: z.boolean(),
  })
  .meta({ title: 'NotificationPreferenceSchema' })

export type NotificationPreferenceDto = z.infer<typeof notificationPreferenceSchema>

export const updateNotificationPreferenceSchema = notificationPreferenceSchema
  .omit({ id: true })
  .partial()
  .meta({ title: 'UpdateNotificationPreferenceSchema' })

export type UpdateNotificationPreferenceInput = z.infer<typeof updateNotificationPreferenceSchema>

export const registerDeviceSchema = z
  .object({
    token: z.string().min(1),
    platform: z.nativeEnum(DevicePlatform),
  })
  .meta({ title: 'RegisterDeviceSchema' })

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>

export const registerWebPushSchema = z
  .object({
    endpoint: z.string().min(1),
    p256dh: z.string().min(1),
    auth: z.string().min(1),
    installationId: z.string().uuid(),
  })
  .meta({ title: 'RegisterWebPushSchema' })

export type RegisterWebPushInput = z.infer<typeof registerWebPushSchema>

export const webPushSubscriptionSchema = z
  .object({
    id: z.string().uuid(),
    installationId: z.string().uuid(),
  })
  .meta({ title: 'WebPushSubscriptionSchema' })

export const removeWebPushResultSchema = z
  .object({
    removed: z.boolean(),
  })
  .meta({ title: 'RemoveWebPushResultSchema' })

export const webPushPublicKeySchema = z
  .object({
    publicKey: z.string().nullable(),
  })
  .meta({ title: 'WebPushPublicKeySchema' })
