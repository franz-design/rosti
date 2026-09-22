import { Migration } from '@mikro-orm/migrations';

export class Migration20260922142257 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "organization" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "slug" varchar(255) null, "logo" varchar(255) null, "metadata" text null, "paymentLink" varchar(255) null, "venue" varchar(255) null, "sportType" text null, "defaultMaxCapacity" int null, "createdAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "organization" add constraint "organization_slug_unique" unique ("slug");`);
    this.addSql(`alter table "organization" add constraint "organization_sportType_check" check ("sportType" in ('football', 'futsal', 'basketball', 'volleyball', 'tennis', 'padel', 'badminton', 'other'));`);

    this.addSql(`create table "season" ("id" uuid not null default gen_random_uuid(), "organizationId" uuid not null, "name" varchar(255) not null, "startsAt" date not null, "endsAt" date null, "status" text not null default 'active', "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "season_organizationId_index" on "season" ("organizationId");`);
    this.addSql(`alter table "season" add constraint "season_status_check" check ("status" in ('active', 'closed'));`);

    this.addSql(`create table "user" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) not null, "firstName" varchar(255) null, "lastName" varchar(255) null, "phone" varchar(255) null, "email" varchar(255) not null, "emailVerified" boolean not null default false, "image" varchar(255) null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "session" ("id" uuid not null default gen_random_uuid(), "expiresAt" timestamptz not null, "token" varchar(255) not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, "ipAddress" varchar(255) null, "userAgent" varchar(255) null, "activeOrganizationId" varchar(255) null, "userId" uuid not null, primary key ("id"));`);
    this.addSql(`alter table "session" add constraint "session_token_unique" unique ("token");`);

    this.addSql(`create table "notification_preference" ("id" uuid not null default gen_random_uuid(), "userId" uuid not null, "emailEnabled" boolean not null default true, "pushEnabled" boolean not null default true, "notifyNewMatch" boolean not null default true, "notifyRsvpReminder" boolean not null default true, "notifyMatchCancelled" boolean not null default true, "chatMentionsOnly" boolean not null default true, "notifyChatMention" boolean not null default true, "notifyAllChatMessages" boolean not null default false, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "notification_preference" add constraint "notification_preference_userId_unique" unique ("userId");`);

    this.addSql(`create table "member" ("id" uuid not null default gen_random_uuid(), "userId" uuid not null, "organizationId" uuid not null, "role" varchar(255) not null default 'member', "createdAt" timestamptz not null, primary key ("id"));`);

    this.addSql(`create table "match_series" ("id" uuid not null default gen_random_uuid(), "organizationId" uuid not null, "seasonId" uuid not null, "title" varchar(255) not null, "location" varchar(255) null, "maxCapacity" int not null, "frequency" text not null, "rrule" varchar(255) null, "startsAt" timestamptz not null, "endsAt" timestamptz null, "reminderOffsetsHours" jsonb null, "createdById" uuid not null, "createdAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "match_series_organizationId_index" on "match_series" ("organizationId");`);
    this.addSql(`alter table "match_series" add constraint "match_series_frequency_check" check ("frequency" in ('weekly', 'monthly', 'monthly_nth_weekday', 'custom'));`);

    this.addSql(`create table "match" ("id" uuid not null default gen_random_uuid(), "organizationId" uuid not null, "seasonId" uuid not null, "seriesId" uuid null, "title" varchar(255) not null, "startsAt" timestamptz not null, "location" varchar(255) null, "maxCapacity" int not null, "status" text not null default 'scheduled', "blueScore" int null, "redScore" int null, "reminderOffsetsHours" jsonb null, "createdById" uuid not null, "cancellationReason" text null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "match_organizationId_index" on "match" ("organizationId");`);
    this.addSql(`create index "match_seasonId_index" on "match" ("seasonId");`);
    this.addSql(`create index "match_startsAt_index" on "match" ("startsAt");`);
    this.addSql(`alter table "match" add constraint "match_status_check" check ("status" in ('scheduled', 'cancelled', 'played'));`);

    this.addSql(`create table "session_fee" ("id" uuid not null default gen_random_uuid(), "matchId" uuid not null, "userId" uuid not null, "amountCents" int not null, "status" text not null default 'owed', "paidAt" timestamptz null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "session_fee_matchId_index" on "session_fee" ("matchId");`);
    this.addSql(`alter table "session_fee" add constraint "session_fee_matchId_userId_unique" unique ("matchId", "userId");`);
    this.addSql(`alter table "session_fee" add constraint "session_fee_status_check" check ("status" in ('owed', 'paid', 'waived'));`);

    this.addSql(`create table "scheduled_job" ("id" uuid not null default gen_random_uuid(), "type" text not null, "matchId" uuid not null, "runAt" timestamptz not null, "status" text not null default 'pending', "payload" jsonb null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "scheduled_job_matchId_index" on "scheduled_job" ("matchId");`);
    this.addSql(`create index "scheduled_job_runAt_index" on "scheduled_job" ("runAt");`);
    this.addSql(`alter table "scheduled_job" add constraint "scheduled_job_type_check" check ("type" in ('match_invite', 'rsvp_reminder', 'score_reminder'));`);
    this.addSql(`alter table "scheduled_job" add constraint "scheduled_job_status_check" check ("status" in ('pending', 'done', 'cancelled', 'failed'));`);

    this.addSql(`create table "match_stat" ("id" uuid not null default gen_random_uuid(), "matchId" uuid not null, "userId" uuid not null, "goals" int not null default 0, "assists" int not null default 0, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "match_stat_matchId_index" on "match_stat" ("matchId");`);
    this.addSql(`alter table "match_stat" add constraint "match_stat_matchId_userId_unique" unique ("matchId", "userId");`);

    this.addSql(`create table "match_message" ("id" uuid not null default gen_random_uuid(), "matchId" uuid not null, "authorId" uuid not null, "body" text not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "match_message_matchId_index" on "match_message" ("matchId");`);

    this.addSql(`create table "message_mention" ("id" uuid not null default gen_random_uuid(), "messageId" uuid not null, "mentionedUserId" uuid not null, "createdAt" timestamptz not null, primary key ("id"));`);

    this.addSql(`create table "match_lineup" ("id" uuid not null default gen_random_uuid(), "matchId" uuid not null, "userId" uuid not null, "team" text not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "match_lineup_matchId_index" on "match_lineup" ("matchId");`);
    this.addSql(`alter table "match_lineup" add constraint "match_lineup_matchId_userId_unique" unique ("matchId", "userId");`);
    this.addSql(`alter table "match_lineup" add constraint "match_lineup_team_check" check ("team" in ('blue', 'red'));`);

    this.addSql(`create table "match_cost" ("id" uuid not null default gen_random_uuid(), "matchId" uuid not null, "pitchCostCents" int not null default 0, "extrasCostCents" int not null default 0, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "match_cost_matchId_index" on "match_cost" ("matchId");`);
    this.addSql(`alter table "match_cost" add constraint "match_cost_matchId_unique" unique ("matchId");`);

    this.addSql(`create table "match_attendance" ("id" uuid not null default gen_random_uuid(), "matchId" uuid not null, "userId" uuid not null, "status" text not null default 'pending', "respondedAt" timestamptz null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "match_attendance_matchId_index" on "match_attendance" ("matchId");`);
    this.addSql(`create index "match_attendance_userId_index" on "match_attendance" ("userId");`);
    this.addSql(`alter table "match_attendance" add constraint "match_attendance_matchId_userId_unique" unique ("matchId", "userId");`);
    this.addSql(`alter table "match_attendance" add constraint "match_attendance_status_check" check ("status" in ('present', 'absent', 'pending'));`);

    this.addSql(`create table "invitation" ("id" uuid not null default gen_random_uuid(), "email" varchar(255) not null, "inviterId" uuid not null, "organizationId" uuid not null, "role" varchar(255) not null, "status" varchar(255) not null, "expiresAt" timestamptz not null, "createdAt" timestamptz not null, "token" varchar(255) null, primary key ("id"));`);

    this.addSql(`create table "device_token" ("id" uuid not null default gen_random_uuid(), "userId" uuid not null, "token" varchar(255) not null, "platform" text not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "device_token_userId_index" on "device_token" ("userId");`);
    this.addSql(`alter table "device_token" add constraint "device_token_platform_check" check ("platform" in ('ios', 'android', 'web'));`);

    this.addSql(`create table "account" ("id" uuid not null default gen_random_uuid(), "accountId" varchar(255) not null, "providerId" varchar(255) not null, "userId" uuid not null, "accessToken" varchar(255) null, "refreshToken" varchar(255) null, "idToken" varchar(255) null, "accessTokenExpiresAt" timestamptz null, "refreshTokenExpiresAt" timestamptz null, "scope" varchar(255) null, "password" varchar(255) null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);

    this.addSql(`create table "verification" ("id" uuid not null default gen_random_uuid(), "identifier" varchar(255) not null, "value" varchar(255) not null, "expiresAt" timestamptz not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "season" add constraint "season_organizationId_foreign" foreign key ("organizationId") references "organization" ("id") on delete cascade;`);

    this.addSql(`alter table "session" add constraint "session_userId_foreign" foreign key ("userId") references "user" ("id");`);

    this.addSql(`alter table "notification_preference" add constraint "notification_preference_userId_foreign" foreign key ("userId") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "member" add constraint "member_userId_foreign" foreign key ("userId") references "user" ("id") on delete cascade;`);
    this.addSql(`alter table "member" add constraint "member_organizationId_foreign" foreign key ("organizationId") references "organization" ("id") on delete cascade;`);

    this.addSql(`alter table "match_series" add constraint "match_series_organizationId_foreign" foreign key ("organizationId") references "organization" ("id") on delete cascade;`);
    this.addSql(`alter table "match_series" add constraint "match_series_seasonId_foreign" foreign key ("seasonId") references "season" ("id") on delete cascade;`);
    this.addSql(`alter table "match_series" add constraint "match_series_createdById_foreign" foreign key ("createdById") references "user" ("id");`);

    this.addSql(`alter table "match" add constraint "match_organizationId_foreign" foreign key ("organizationId") references "organization" ("id") on delete cascade;`);
    this.addSql(`alter table "match" add constraint "match_seasonId_foreign" foreign key ("seasonId") references "season" ("id") on delete cascade;`);
    this.addSql(`alter table "match" add constraint "match_seriesId_foreign" foreign key ("seriesId") references "match_series" ("id") on delete set null;`);
    this.addSql(`alter table "match" add constraint "match_createdById_foreign" foreign key ("createdById") references "user" ("id");`);

    this.addSql(`alter table "session_fee" add constraint "session_fee_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`);
    this.addSql(`alter table "session_fee" add constraint "session_fee_userId_foreign" foreign key ("userId") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "scheduled_job" add constraint "scheduled_job_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`);

    this.addSql(`alter table "match_stat" add constraint "match_stat_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`);
    this.addSql(`alter table "match_stat" add constraint "match_stat_userId_foreign" foreign key ("userId") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "match_message" add constraint "match_message_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`);
    this.addSql(`alter table "match_message" add constraint "match_message_authorId_foreign" foreign key ("authorId") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "message_mention" add constraint "message_mention_messageId_foreign" foreign key ("messageId") references "match_message" ("id") on delete cascade;`);
    this.addSql(`alter table "message_mention" add constraint "message_mention_mentionedUserId_foreign" foreign key ("mentionedUserId") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "match_lineup" add constraint "match_lineup_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`);
    this.addSql(`alter table "match_lineup" add constraint "match_lineup_userId_foreign" foreign key ("userId") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "match_cost" add constraint "match_cost_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`);

    this.addSql(`alter table "match_attendance" add constraint "match_attendance_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`);
    this.addSql(`alter table "match_attendance" add constraint "match_attendance_userId_foreign" foreign key ("userId") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "invitation" add constraint "invitation_inviterId_foreign" foreign key ("inviterId") references "user" ("id");`);
    this.addSql(`alter table "invitation" add constraint "invitation_organizationId_foreign" foreign key ("organizationId") references "organization" ("id") on delete cascade;`);

    this.addSql(`alter table "device_token" add constraint "device_token_userId_foreign" foreign key ("userId") references "user" ("id") on delete cascade;`);

    this.addSql(`alter table "account" add constraint "account_userId_foreign" foreign key ("userId") references "user" ("id");`);
  }

}
