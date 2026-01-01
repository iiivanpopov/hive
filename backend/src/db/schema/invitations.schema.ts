import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'
import z from 'zod'

import { IdSchema, IsoDateTimeSchema } from '@/shared/zod'

import { communities } from './communities.schema'

export const invitations = s.sqliteTable('invitation_links', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  communityId: s.integer('community_id')
    .notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  link: s.text('link')
    .unique()
    .notNull(),
  expiresAt: s.integer('expires_at', { mode: 'timestamp' }),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export type Invitation = typeof invitations.$inferSelect

export const InvitationSchema = z.object({
  id: IdSchema,
  communityId: IdSchema,
  link: z.url(),
  expiresAt: IsoDateTimeSchema.nullable(),
  createdAt: IsoDateTimeSchema,
})
