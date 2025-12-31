import type { Table } from 'drizzle-orm'
import type { DrizzleDatabase } from '@/db/instance'
import { Database } from 'bun:sqlite'
import { getTableName, sql } from 'drizzle-orm'
import { createDatabase } from '@/db/instance'

const memoryClient = new Database(':memory:')
export const memoryDatabase = createDatabase(memoryClient)

export function resetDatabase(db: DrizzleDatabase, schema: Record<string, Table>) {
  // ignoring error because this is only for tests
  try {
    const tablesToTruncate = Object.values(schema).map(table => getTableName(table))

    db.run(sql`PRAGMA foreign_keys = OFF`)
    for (const tableName of tablesToTruncate) {
      db.run(sql.raw(`delete from \`${tableName}\`;`))
    }
    db.run(sql`PRAGMA foreign_keys = ON`)
  }
  catch {}
  finally {
    db.run(sql`PRAGMA foreign_keys = ON`)
  }
}
