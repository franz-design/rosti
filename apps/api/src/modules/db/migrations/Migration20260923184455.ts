import { Migration } from '@mikro-orm/migrations';

export class Migration20260923184455 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "organization" add "matchInviteLeadDays" int not null default 5, add "matchInviteReminderLeadDays" int null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "organization" drop column "matchInviteLeadDays", drop column "matchInviteReminderLeadDays";`);
  }

}
