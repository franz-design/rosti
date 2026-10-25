import { Migration } from '@mikro-orm/migrations'

export class Migration20261025145126 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "organization" add "defaultPitchCostCents" int not null default 0;`)
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "organization" drop column "defaultPitchCostCents";`)
  }
}
