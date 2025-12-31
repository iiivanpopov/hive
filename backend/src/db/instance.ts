import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { relations } from './relations'

export function createDatabase(client: Database) {
  return drizzle({ client, relations })
}
export type DrizzleDatabase = ReturnType<typeof createDatabase>

const client = new Database(Bun.env.DB_URL)
export const db = createDatabase(client)
