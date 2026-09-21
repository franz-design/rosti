import { Migration } from '@mikro-orm/migrations'

export class Migration20260921152646 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "scheduled_job" drop constraint if exists "scheduled_job_type_check";`)
    this.addSql(
      `alter table "scheduled_job" add constraint "scheduled_job_type_check" check ("type" in ('match_invite', 'rsvp_reminder', 'score_reminder'));`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "scheduled_job" drop constraint if exists "scheduled_job_type_check";`)
    this.addSql(
      `alter table "scheduled_job" add constraint "scheduled_job_type_check" check ("type" in ('match_invite', 'rsvp_reminder'));`,
    )
  }
}
