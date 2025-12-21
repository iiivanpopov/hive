import { Cron } from 'croner'
import { lt } from 'drizzle-orm'
import { authConfig } from '@/config'
import { db } from '@/db/instance'
import { sessions } from '@/db/schema'

const _tokensCleanup = new Cron('0 * * * *', () =>
  db
    .delete(sessions)
    .where(lt(sessions.lastActivityAt, new Date(Date.now() - authConfig.sessionTokenTTL * 1000))))
