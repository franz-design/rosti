import { Migration } from '@mikro-orm/migrations'

export class Migration20261025170000 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`
      insert into "match_attendance" ("id", "matchId", "userId", "status", "createdAt", "updatedAt")
      select gen_random_uuid(), m."id", mem."userId", 'pending', now(), now()
      from "match" m
      inner join "member" mem on mem."organizationId" = m."organizationId"
      where m."status" = 'scheduled'
        and m."startsAt" > now()
        and not exists (
          select 1
          from "match_attendance" existing
          where existing."matchId" = m."id"
            and existing."userId" = mem."userId"
        );
    `)
  }

  override down(): void | Promise<void> {
    // Rows added here look the same as attendances created with the match.
  }
}
