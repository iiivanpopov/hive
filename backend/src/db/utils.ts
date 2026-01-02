import { getTableName, sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import path from 'node:path'

import type { DrizzleDatabase } from './instance'

import { communities } from './tables/communities'
import { communityMembers } from './tables/community-members'
import { invitations } from './tables/invitations'
import { users } from './tables/users'

export function migrateDatabase(db: DrizzleDatabase) {
  migrate(db, { migrationsFolder: path.resolve(__dirname, '../../drizzle') })
}

export function resetDatabase(db: DrizzleDatabase) {
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
    db.run(sql`DELETE FROM sqlite_sequence;`)
    db.run(sql`PRAGMA foreign_keys = ON`)
  }
  catch {}
  finally {
    db.run(sql`PRAGMA foreign_keys = ON`)
  }
}
