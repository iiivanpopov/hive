import { afterEach, mock } from 'bun:test'

afterEach(() => {
  mock.clearAllMocks()
  mock.restore()
})
