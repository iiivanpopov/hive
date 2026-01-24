import { describe, expect, expectTypeOf, it } from 'bun:test'

import { generateInvitationId } from '@/lib/utils'

describe('generateInvitationId', () => {
  it('should return a string of length 16', () => {
    const invitationId = generateInvitationId()

    expectTypeOf(invitationId).toBeString()
    expect(invitationId).toHaveLength(16)
  })
})
