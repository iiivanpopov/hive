import { defineRelations } from 'drizzle-orm'
import { confirmTokens, sessions, users } from './schema'

export const relations = defineRelations({
  users,
  sessions,
  confirmTokens,
}, r => ({
  users: {
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId,
    }),
    confirmToken: r.many.confirmTokens({
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
  confirmTokens: {
    user: r.one.users({
      from: r.confirmTokens.userId,
      to: r.users.id,
    }),
  },
}))
