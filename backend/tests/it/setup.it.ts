import { afterEach, beforeAll } from 'bun:test'

import { migrateDatabase, resetDatabase } from '@/db/utils'
import { cacheMock } from '@/tests/mocks/cache.mock'
import { databaseMock } from '@/tests/mocks/database.mock'

beforeAll(() => {
  migrateDatabase(databaseMock)
})

afterEach(() => {
  resetDatabase(databaseMock)
  cacheMock.reset()
})
