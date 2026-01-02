import { Database } from 'bun:sqlite'

import { createDatabase } from '@/db/utils'

const client = new Database(':memory:')
export const databaseMock = createDatabase(client)
