import { Migration } from '@mikro-orm/migrations'

export class Migration20261011182935 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "scheduled_job" drop constraint "scheduled_job_type_check";`)
    this.addSql(
      `alter table "scheduled_job" add constraint "scheduled_job_type_check" check ("type" in ('match_invite', 'rsvp_reminder', 'score_reminder', 'fee_request', 'fee_reminder'));`,
    )
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "scheduled_job" drop constraint "scheduled_job_type_check";`)
    this.addSql(
      `alter table "scheduled_job" add constraint "scheduled_job_type_check" check ("type" in ('match_invite', 'rsvp_reminder', 'score_reminder'));`,
    )
  }
}
