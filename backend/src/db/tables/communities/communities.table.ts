import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

import { users } from '../users'

export const communities = s.sqliteTable('communities', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  ownerId: s.integer('owner_id')
    .notNull()
    .references(() => users.id),
  name: s.text('name').notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export type Community = typeof communities.$inferSelect
