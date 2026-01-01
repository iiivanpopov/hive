import { describe, expect, expectTypeOf, it } from 'bun:test'

import { generateJoinId } from '@/lib/utils'

describe('generateJoinId', () => {
  it('should return a string of length 16', () => {
    const joinId = generateJoinId()

    expectTypeOf(joinId).toBeString()
    expect(joinId).toHaveLength(16)
  })
})
