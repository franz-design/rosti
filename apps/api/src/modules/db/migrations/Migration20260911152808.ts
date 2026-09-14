import { Migration } from '@mikro-orm/migrations'

export class Migration20260911152808 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "match" add column if not exists "blueScore" int null;`)
    this.addSql(`alter table "match" add column if not exists "redScore" int null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "match" drop column if exists "blueScore";`)
    this.addSql(`alter table "match" drop column if exists "redScore";`)
  }
}
