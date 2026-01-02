import type { AuthRouter } from '@/modules/auth'
import type { ChannelsRouter } from '@/modules/channels/channels.router'
import type { CommunitiesRouter } from '@/modules/communities'
import type { CommunityMembersRouter } from '@/modules/community-members'
import type { InvitationsRouter } from '@/modules/invitations'

import { factory } from '@/lib/factory'

export class Router {
  constructor(
    private readonly authRouter: AuthRouter,
    private readonly communitiesRouter: CommunitiesRouter,
    private readonly invitationsRouter: InvitationsRouter,
    private readonly communityMembersRouter: CommunityMembersRouter,
    private readonly channelsRouter: ChannelsRouter,
  ) {}

  init() {
    const app = factory
      .createApp()
      .route('/', this.authRouter.init())
      .route('/', this.communitiesRouter.init())
      .route('/', this.communityMembersRouter.init())
      .route('/', this.invitationsRouter.init())
      .route('/', this.channelsRouter.init())

    return app
  }
}
