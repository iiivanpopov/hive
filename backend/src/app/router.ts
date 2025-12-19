import { factory } from '@/lib/factory'
import { authRouter } from '@/modules/auth.router'

export const router = factory.createApp()
  .route('/auth', authRouter)
