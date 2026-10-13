import { Migration } from '@mikro-orm/migrations'

export class Migration20261013060026 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `alter table "device_token" add "p256dh" text null, add "authSecret" text null, add "installationId" uuid null;`,
    )
    this.addSql(`alter table "device_token" alter column "token" type text using ("token"::text);`)
    this.addSql(
      `create index "device_token_installationId_index" on "device_token" ("installationId");`,
    )
  }

  override down(): void | Promise<void> {
    this.addSql(`drop index "device_token_installationId_index";`)
    this.addSql(
      `alter table "device_token" drop column "p256dh", drop column "authSecret", drop column "installationId";`,
    )
    this.addSql(
      `alter table "device_token" alter column "token" type varchar(255) using ("token"::varchar(255));`,
    )
  }
}
