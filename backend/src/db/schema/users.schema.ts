import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'

export const users = s.sqliteTable('users', {
  id: s.integer('id').primaryKey({ autoIncrement: true }),
  name: s.text('name'),
  username: s.text('username')
    .notNull()
    .unique(),
  email: s.text('email')
    .notNull()
    .unique(),
  emailConfirmed: s.integer('email_confirmed', { mode: 'boolean' })
    .default(false)
    .notNull(),
  passwordHash: s.text('password_hash').notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: s.integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})
