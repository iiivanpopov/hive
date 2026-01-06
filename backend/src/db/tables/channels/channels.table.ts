import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

import { communities } from '../communities'

export const channelTypes = ['text', 'voice'] as const
export type ChannelType = (typeof channelTypes)[number]

export const channels = s.sqliteTable('channels', {
  id: s.int('id').primaryKey({ autoIncrement: true }),
  communityId: s.int('community_id')
    .notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  name: s.text('name').notNull(),
  slug: s.text('slug').notNull(),
  type: s.text('type', { enum: channelTypes }).notNull(),
  description: s.text('description'),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
}, t => [
  s.unique('community_id_slug').on(
    t.communityId,
    t.slug,
  ),
])

export type Channel = typeof channels.$inferSelect
