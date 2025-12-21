import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'
import { users } from './users.schema'

export const confirmTokens = s.sqliteTable('confirm_tokens', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  userId: s.integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: s.text('token').unique().notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})
