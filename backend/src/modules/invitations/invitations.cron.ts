import { Cron } from 'croner'
import { and, isNotNull, lt, sql } from 'drizzle-orm'

import type { DrizzleDatabase } from '@/db/instance'

import { invitations } from '@/db/tables/invitations'
import { pino } from '@/lib/pino'

export class InvitationsCron {
  expiredInvitationsCleanupInterval = 60 * 60 * 1000 // 1 hour

  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  init() {
    const _deleteExpiredInvitationsJob = new Cron('* * * * * *', {
      interval: this.expiredInvitationsCleanupInterval,
      protect: true,
    }, async () => {
      pino.info('Deleting expired community invitations...')
      const count = await this.db
        .delete(invitations)
        .where(
          and(
            isNotNull(invitations.expiresAt),
            lt(invitations.expiresAt, sql`unixepoch()`),
          ),
        )
        .returning()
      pino.info(`Deleted ${count.length} expired community invitations.`)
    })
  }
}
