import { Database } from 'bun:sqlite'
import { getTableName, sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import path from 'node:path'

import type { DrizzleDatabase } from '@/db/instance'

import { createDatabase } from '@/db/instance'
import { communities } from '@/db/tables/communities'
import { communityMembers } from '@/db/tables/community-members'
import { invitations } from '@/db/tables/invitations'
import { users } from '@/db/tables/users'

const memoryClient = new Database(':memory:')
export const memoryDatabase = createDatabase(memoryClient)

export function resetDatabase(db: DrizzleDatabase) {
  // ignoring error because this is only for tests
  try {
    const tablesToTruncate = [
      users,
      communities,
      communityMembers,
      invitations,
    ].map(table => getTableName(table))

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

export function migrateDatabase(db: DrizzleDatabase) {
  migrate(db, { migrationsFolder: path.resolve(__dirname, '../../drizzle') })
}
