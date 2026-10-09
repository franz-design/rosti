import { Migration } from '@mikro-orm/migrations'

export class Migration20261009154845 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "match_player_vote" ("id" uuid not null default gen_random_uuid(), "matchId" uuid not null, "voterId" uuid not null, "nomineeId" uuid not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`,
    )
    this.addSql(
      `create index "match_player_vote_matchId_index" on "match_player_vote" ("matchId");`,
    )
    this.addSql(
      `create index "match_player_vote_voterId_index" on "match_player_vote" ("voterId");`,
    )
    this.addSql(
      `create index "match_player_vote_nomineeId_index" on "match_player_vote" ("nomineeId");`,
    )
    this.addSql(
      `alter table "match_player_vote" add constraint "match_player_vote_matchId_voterId_unique" unique ("matchId", "voterId");`,
    )

    this.addSql(
      `alter table "match_player_vote" add constraint "match_player_vote_matchId_foreign" foreign key ("matchId") references "match" ("id") on delete cascade;`,
    )
    this.addSql(
      `alter table "match_player_vote" add constraint "match_player_vote_voterId_foreign" foreign key ("voterId") references "user" ("id") on delete cascade;`,
    )
    this.addSql(
      `alter table "match_player_vote" add constraint "match_player_vote_nomineeId_foreign" foreign key ("nomineeId") references "user" ("id") on delete cascade;`,
    )

    this.addSql(
      `alter table "notification_preference" add "notifyPlayerVote" boolean not null default true;`,
    )

    this.addSql(
      `alter table "match" add "playerVoteOpenedAt" timestamptz null, add "playerVoteClosesAt" timestamptz null, add "playerVoteClosedAt" timestamptz null, add "playerVoteIsTie" boolean not null default false, add "playerVoteWinnerId" uuid null;`,
    )
    this.addSql(
      `alter table "match" add constraint "match_playerVoteWinnerId_foreign" foreign key ("playerVoteWinnerId") references "user" ("id") on delete set null;`,
    )
    this.addSql(`create index "match_playerVoteClosesAt_index" on "match" ("playerVoteClosesAt");`)
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "match_player_vote" cascade;`)

    this.addSql(`alter table "match" drop constraint "match_playerVoteWinnerId_foreign";`)

    this.addSql(`drop index "match_playerVoteClosesAt_index";`)
    this.addSql(
      `alter table "match" drop column "playerVoteOpenedAt", drop column "playerVoteClosesAt", drop column "playerVoteClosedAt", drop column "playerVoteIsTie", drop column "playerVoteWinnerId";`,
    )

    this.addSql(`alter table "notification_preference" drop column "notifyPlayerVote";`)
  }
}
