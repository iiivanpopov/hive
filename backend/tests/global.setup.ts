import { mock } from 'bun:test'
import { afterEach } from 'vitest'

afterEach(() => {
  mock.clearAllMocks()
  mock.restore()
})
