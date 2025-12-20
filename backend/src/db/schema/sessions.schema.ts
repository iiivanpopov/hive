import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'
import { users } from './users.schema'

export const sessions = s.sqliteTable('sessions', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  userId: s.integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: s.text('token').notNull(),
  lastActivityAt: s.integer('last_activity_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})
