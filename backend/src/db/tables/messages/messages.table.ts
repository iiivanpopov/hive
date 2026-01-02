import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

import { channels } from '../channels'
import { users } from '../users'

export const messages = s.sqliteTable('messages', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  channelId: s.integer('channel_id')
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  userId: s.integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: s.text('content').notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: s.integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export type Message = typeof messages.$inferSelect
