import { Database } from 'bun:sqlite'

import { createDatabase } from './utils'

const client = new Database(Bun.env.DB_URL)
export const db = createDatabase(client)
