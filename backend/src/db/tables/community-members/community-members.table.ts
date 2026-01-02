import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

import { communities } from '../communities'
import { users } from '../users'

export const communityMemberRoles = ['owner', 'member'] as const
export type CommunityMemberRole = (typeof communityMemberRoles)[number]

export const communityMembers = s.sqliteTable('community_members', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  communityId: s.integer('community_id')
    .notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  userId: s.integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: s.text('role', { enum: communityMemberRoles })
    .default('member')
    .notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export type CommunityMember = typeof communityMembers.$inferSelect
