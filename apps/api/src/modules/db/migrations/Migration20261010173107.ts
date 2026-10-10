import { Migration } from '@mikro-orm/migrations'

export class Migration20261010173107 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "player_skill" ("id" uuid not null default gen_random_uuid(), "organizationId" uuid not null, "userId" uuid not null, "skill" varchar(255) not null, "value" int not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`,
    )
    this.addSql(
      `create index "player_skill_organizationId_index" on "player_skill" ("organizationId");`,
    )
    this.addSql(
      `alter table "player_skill" add constraint "player_skill_organizationId_userId_skill_unique" unique ("organizationId", "userId", "skill");`,
    )

    this.addSql(
      `alter table "player_skill" add constraint "player_skill_organizationId_foreign" foreign key ("organizationId") references "organization" ("id") on delete cascade;`,
    )
    this.addSql(
      `alter table "player_skill" add constraint "player_skill_userId_foreign" foreign key ("userId") references "user" ("id") on delete cascade;`,
    )
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "player_skill" cascade;`)
  }
}
