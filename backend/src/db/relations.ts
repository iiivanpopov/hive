import { defineRelations } from 'drizzle-orm'
import { users } from './schema'

export const relations = defineRelations({
  users,
})
