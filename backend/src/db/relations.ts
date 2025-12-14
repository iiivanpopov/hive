import { defineRelations } from 'drizzle-orm'
import { sessions } from './schemas/sessions.schema'
import { users } from './schemas/users.schema'

export const relations = defineRelations({
  users,
  sessions,
}, r => ({
  users: {
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId,
    }),
  },
}))
