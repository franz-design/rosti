import { describe, expect, it } from 'vitest'
import { isPlayerMissingError } from './is-player-missing-error'

describe('isPlayerMissingError', () => {
  it('treats a missing player and a bad id as not found', () => {
    expect(isPlayerMissingError(new Error(JSON.stringify({ statusCode: 404 })))).toBe(true)
    expect(isPlayerMissingError(new Error(JSON.stringify({ statusCode: 400 })))).toBe(true)
  })

  it('leaves other failures as load errors', () => {
    expect(isPlayerMissingError(new Error(JSON.stringify({ statusCode: 500 })))).toBe(false)
    expect(isPlayerMissingError(new Error('network down'))).toBe(false)
    expect(isPlayerMissingError('nope')).toBe(false)
  })
})
