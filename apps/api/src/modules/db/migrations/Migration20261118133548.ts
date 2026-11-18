import { Migration } from '@mikro-orm/migrations'

export class Migration20261118133548 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "match_activity" ("id" uuid not null default gen_random_uuid(), "matchId" uuid not null, "actorId" uuid null, "subjectId" uuid null, "area" text not null, "action" text not null, "details" jsonb not null, "createdAt" timestamptz not null, primary key ("id"));`,
    )
    this.addSql(
      `create index "match_activity_matchId_area_createdAt_index" on "match_activity" ("matchId", "area", "createdAt");`,
    )

    this.addSql(
      `alter table "match_activity" add constraint "match_activity_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`,
    )
    this.addSql(
      `alter table "match_activity" add constraint "match_activity_actorId_foreign" foreign key ("actorId") references "user" ("id") on delete set null;`,
    )
    this.addSql(
      `alter table "match_activity" add constraint "match_activity_subjectId_foreign" foreign key ("subjectId") references "user" ("id") on delete set null;`,
    )
    this.addSql(
      `alter table "match_activity" add constraint "match_activity_area_check" check ("area" in ('attendance', 'score', 'payment'));`,
    )
    this.addSql(
      `alter table "match_activity" add constraint "match_activity_action_check" check ("action" in ('attendance_changed', 'score_changed', 'player_stats_changed', 'match_cost_changed', 'fee_status_changed', 'fee_shares_changed', 'fees_reminded'));`,
    )
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "match_activity" cascade;`)
  }
}
