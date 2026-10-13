import { Migration } from '@mikro-orm/migrations'

export class Migration20261013074848 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "organization" add "matchDurationMinutes" int not null default 90;`)

    this.addSql(
      `update "scheduled_job" as job
        set "runAt" = m."startsAt" + interval '105 minutes'
        from "match" as m
        where job."matchId" = m."id"
          and job."status" = 'pending'
          and job."type" in ('score_reminder', 'fee_request');`,
    )
  }

  override down(): void | Promise<void> {
    this.addSql(
      `update "scheduled_job" as job
        set "runAt" = m."startsAt" + interval '90 minutes'
        from "match" as m
        where job."matchId" = m."id"
          and job."status" = 'pending'
          and job."type" in ('score_reminder', 'fee_request');`,
    )

    this.addSql(`alter table "organization" drop column "matchDurationMinutes";`)
  }
}
