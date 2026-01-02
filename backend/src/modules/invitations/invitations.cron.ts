import { Cron } from 'croner'
import { and, isNotNull, lt } from 'drizzle-orm'

import type { DrizzleDatabase } from '@/db/utils'

import { invitations } from '@/db/tables/invitations'
import { pino } from '@/lib/pino'

export class InvitationsCron {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async deleteExpiredInvitations(now: Date = new Date()) {
    const result = await this.db
      .delete(invitations)
      .where(
        and(
          isNotNull(invitations.expiresAt),
          lt(invitations.expiresAt, now),
        ),
      )
      .returning()

    return result.length
  }

  init() {
    new Cron('0 * * * *', { protect: true }, async () => {
      const count = await this.deleteExpiredInvitations()
      pino.info(`Deleted ${count} expired community invitations.`)
    })
  }
}
