import { describe, expect, it } from 'vitest'
import { createRenameMatchFormSchema } from './rename-match-form'

describe('createRenameMatchFormSchema', () => {
  const schema = createRenameMatchFormSchema({ titleRequired: 'required' })

  it('rejects a blank title', () => {
    const actual = schema.safeParse({ title: '   ', scope: 'match' })

    expect(actual.success).toBe(false)
  })

  it('trims the title and keeps the following scope', () => {
    const actual = schema.safeParse({ title: '  Mardi  ', scope: 'following' })

    expect(actual.success).toBe(true)
    if (!actual.success) return
    expect(actual.data).toEqual({ title: 'Mardi', scope: 'following' })
  })
})
