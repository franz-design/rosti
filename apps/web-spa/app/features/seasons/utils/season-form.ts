import { z } from 'zod'
import { isCalendarEndBeforeStart, type SeasonFormValues } from './season-dates'

interface SeasonFormMessages {
  nameRequired: string
  endBeforeStart: string
}

export function createSeasonFormSchema(messages: SeasonFormMessages) {
  return z
    .object({
      name: z.string().trim().min(1, messages.nameRequired),
      startsAt: z.date(),
      endsAt: z.date().nullable(),
    })
    .refine((value: SeasonFormValues) => !isCalendarEndBeforeStart(value.startsAt, value.endsAt), {
      message: messages.endBeforeStart,
      path: ['endsAt'],
    })
}
