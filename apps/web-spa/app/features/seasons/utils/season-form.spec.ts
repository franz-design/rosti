import { describe, expect, it } from 'vitest'
import { createSeasonFormSchema } from './season-form'

const schema = createSeasonFormSchema({
  nameRequired: 'name',
  endBeforeStart: 'end',
})

describe('createSeasonFormSchema', () => {
  it('accepts a season that ends on the start day', () => {
    const actual = schema.safeParse({
      name: ' Saison 2026 ',
      startsAt: new Date(2026, 8, 1),
      endsAt: new Date(2026, 8, 1),
    })

    expect(actual.success).toBe(true)
    if (actual.success) expect(actual.data.name).toBe('Saison 2026')
  })

  it('rejects an end date before the start', () => {
    const actual = schema.safeParse({
      name: 'Saison 2026',
      startsAt: new Date(2026, 8, 2),
      endsAt: new Date(2026, 8, 1),
    })

    expect(actual.success).toBe(false)
  })

  it('rejects an empty name', () => {
    const actual = schema.safeParse({
      name: '   ',
      startsAt: new Date(2026, 8, 1),
      endsAt: null,
    })

    expect(actual.success).toBe(false)
  })
})
