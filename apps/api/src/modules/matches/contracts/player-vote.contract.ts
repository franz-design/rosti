import { z } from 'zod'

export enum PlayerVotePhase {
  Unavailable = 'unavailable',
  Open = 'open',
  Closed = 'closed',
}

const playerVotePlayerSchema = z
  .object({
    userId: z.string().uuid(),
    userName: z.string(),
    image: z.string().nullish(),
  })
  .meta({ title: 'PlayerVotePlayerSchema' })

export const playerVoteStateSchema = z
  .object({
    phase: z.nativeEnum(PlayerVotePhase),
    closesAt: z.coerce.date().nullish(),
    canVote: z.boolean(),
    candidates: z.array(playerVotePlayerSchema),
    myNomineeUserId: z.string().uuid().nullish(),
    winner: playerVotePlayerSchema.nullable(),
    isTie: z.boolean(),
  })
  .meta({ title: 'PlayerVoteStateSchema' })

export type PlayerVoteStateDto = z.infer<typeof playerVoteStateSchema>

export const castPlayerVoteSchema = z
  .object({
    nomineeUserId: z.string().uuid(),
  })
  .meta({ title: 'CastPlayerVoteSchema' })

export type CastPlayerVoteInput = z.infer<typeof castPlayerVoteSchema>
