import { Database } from 'bun:sqlite'

import { createDatabase } from '@/db/instance'

const client = new Database(':memory:')
export const databaseMock = createDatabase(client)
