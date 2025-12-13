import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { relations } from './relations'

const sqlite = new Database(Bun.env.DB_URL)
export const db = drizzle({ client: sqlite, relations })
