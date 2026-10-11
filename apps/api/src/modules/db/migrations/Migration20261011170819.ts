import { Migration } from '@mikro-orm/migrations'

export class Migration20261011170819 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `alter table "organization" add "feeReminderDelaysDays" jsonb not null default '[3,7]';`,
    )

    this.addSql(
      `alter table "notification_preference" add "notifyFeeRequest" boolean not null default true;`,
    )

    this.addSql(
      `alter table "session_fee" add "shares" int not null default 1, add "reminderCount" int not null default 0, add "lastRemindedAt" timestamptz null;`,
    )

    this.addSql(`alter table "match_cost" add "feesNotifiedAt" timestamptz null;`)
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "match_cost" drop column "feesNotifiedAt";`)

    this.addSql(`alter table "notification_preference" drop column "notifyFeeRequest";`)

    this.addSql(`alter table "organization" drop column "feeReminderDelaysDays";`)

    this.addSql(
      `alter table "session_fee" drop column "shares", drop column "reminderCount", drop column "lastRemindedAt";`,
    )
  }
}
