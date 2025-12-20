import { factory } from '@/lib/factory'
import { authRouter } from '@/modules/auth/auth.router'

export const router = factory.createApp()
  .route('/', authRouter)
