import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { relations } from './relations'

export function createDb(client: Database) {
  return drizzle({ client, relations })
}

const client = new Database(Bun.env.DB_URL)
export const db = createDb(client)

export type DrizzleDatabase = ReturnType<typeof createDb>
