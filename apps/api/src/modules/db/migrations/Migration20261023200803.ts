import { Migration } from '@mikro-orm/migrations'

export class Migration20261023200803 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`
      delete from "member" as duplicate
      using "member" as kept
      where duplicate."userId" = kept."userId"
        and duplicate."organizationId" = kept."organizationId"
        and (
          duplicate."createdAt" > kept."createdAt"
          or (duplicate."createdAt" = kept."createdAt" and duplicate."id" > kept."id")
        );
    `)
    this.addSql(
      `alter table "member" add constraint "member_userId_organizationId_unique" unique ("userId", "organizationId");`,
    )
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "member" drop constraint "member_userId_organizationId_unique";`)
  }
}
