import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { dbConfig } from '@/config/db.config'

const client = new Database(dbConfig.url)
export const db = drizzle({ client })
