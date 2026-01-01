import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'
import z from 'zod'

import { IdSchema } from '@/shared/zod'

import { users } from './users.schema'

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

export const CommunitySchema = z.object({
  id: IdSchema,
  ownerId: IdSchema,
  name: z.string(),
  createdAt: z.iso.datetime(),
})
