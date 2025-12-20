import { expect, test } from 'bun:test'
import { generateToken } from '@/lib/utils'

const TOKEN_LENGTH = 16 * 2 // 16 bytes in hex representation

test('generate token', () => {
  const token = generateToken()

  expect(token).toHaveLength(TOKEN_LENGTH)
})
