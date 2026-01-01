import { sql } from 'drizzle-orm'
import * as s from 'drizzle-orm/sqlite-core'
import z from 'zod'

import { IdSchema, IsoDateTimeSchema } from '@/shared/zod'

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
  passwordHash: s.text('password_hash')
    .notNull(),
  createdAt: s.integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: s.integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export type User = typeof users.$inferSelect

export const UserDtoSchema = z.object({
  id: IdSchema,
  name: z.string().nullable(),
  username: z.string(),
  email: z.email(),
  emailConfirmed: z.boolean(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})
export type UserDto = z.infer<typeof UserDtoSchema>

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    emailConfirmed: user.emailConfirmed,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
