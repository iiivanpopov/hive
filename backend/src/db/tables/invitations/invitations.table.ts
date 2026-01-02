import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

import { communities } from '../communities/communities.table'

export const invitations = s.sqliteTable('invitation', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  communityId: s.integer('community_id')
    .notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  token: s.text('token')
    .unique()
    .notNull(),
  expiresAt: s.integer('expires_at', { mode: 'timestamp' }),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export type Invitation = typeof invitations.$inferSelect
