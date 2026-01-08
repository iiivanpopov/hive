import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

import { communities } from '../communities'

export const channels = s.sqliteTable('channels', {
  id: s.int('id').primaryKey({ autoIncrement: true }),
  communityId: s.int('community_id')
    .notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  name: s.text('name').notNull(),
  description: s.text('description'),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export type Channel = typeof channels.$inferSelect
