import type { AuthRouter } from '@/modules/auth/auth.router'
import { factory } from '@/lib/factory'

export class Router {
  constructor(
    private readonly authRouter: AuthRouter,
  ) {}

  init() {
    const app = factory
      .createApp()
      .route('/', this.authRouter.init())

    return app
  }
}
