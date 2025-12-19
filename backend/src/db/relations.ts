import { defineRelations } from 'drizzle-orm'
import { sessions, users } from './schema'

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
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
}))
