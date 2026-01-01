import type { AuthRouter } from '@/modules/auth/auth.router'
import type { CommunitiesRouter } from '@/modules/communities/communities.router'
import type { InvitationsRouter } from '@/modules/invitations/invitations.router'

import { factory } from '@/lib/factory'

export class Router {
  constructor(
    private readonly authRouter: AuthRouter,
    private readonly communitiesRouter: CommunitiesRouter,
    private readonly invitationsRouter: InvitationsRouter,
  ) {}

  init() {
    const app = factory
      .createApp()
      .route('/', this.authRouter.init())
      .route('/', this.communitiesRouter.init())
      .route('/', this.invitationsRouter.init())

    return app
  }
}
