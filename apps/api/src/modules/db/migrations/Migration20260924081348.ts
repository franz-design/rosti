import { Migration } from '@mikro-orm/migrations'

export class Migration20260924081348 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "notification_preference" drop column "chatMentionsOnly";`)
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "notification_preference" add "chatMentionsOnly" boolean not null default true;`,
    )
  }
}
