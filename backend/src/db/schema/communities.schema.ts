import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

import { users } from './users.schema'

export const communities = s.sqliteTable('communities', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  ownerId: s.integer('owner_id')
    .notNull()
    .references(() => users.id),
  joinId: s.text('join_id')
    .notNull()
    .unique(),
  name: s.text('name').notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export type Community = typeof communities.$inferSelect
