import { describe, expect, it } from 'vitest'
import { extractMentionIds, splitMentionedBody, toPlainMentionBody } from './chat-mentions'

describe('chat-mentions', () => {
  it('converts markup to plain @Name body', () => {
    expect(toPlainMentionBody('Hey @[Alex](u-1) and @[Bo](u-2)!')).toBe('Hey @Alex and @Bo!')
  })

  it('extracts unique mention ids from markup', () => {
    expect(extractMentionIds('Hey @[Alex](u-1) again @[Alex](u-1) and @[Bo](u-2)')).toEqual([
      'u-1',
      'u-2',
    ])
  })

  it('splits body so longer names win over shorter prefixes', () => {
    expect(splitMentionedBody('Hi @Alex Martin and @Alex', ['Alex Martin', 'Alex'])).toEqual([
      { type: 'text', value: 'Hi ' },
      { type: 'mention', value: '@Alex Martin' },
      { type: 'text', value: ' and ' },
      { type: 'mention', value: '@Alex' },
    ])
  })
})
