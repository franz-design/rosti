import { Migration } from '@mikro-orm/migrations'

export class Migration20261029090000 extends Migration {
  override up(): void | Promise<void> {
    // A player who is not present cannot stay on a team.
    this.addSql(`
      delete from "match_lineup" as lineup
      where not exists (
        select 1
        from "match_attendance" as attendance
        where attendance."matchId" = lineup."matchId"
          and attendance."userId" = lineup."userId"
          and attendance."status" = 'present'
      );
    `)
  }

  override down(): void | Promise<void> {
    // The removed team spots cannot be restored: absence does not say which team they had.
  }
}
