import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

export const users = s.sqliteTable('users', {
  id: s.integer('id').primaryKey(),
  name: s.text('name').notNull(),
  username: s.text('username').notNull().unique(),
  email: s.text('email').notNull().unique(),
  passwordHash: s.text('password_hash').notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: s.integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})
