import { factory } from '@/lib/factory'

export const router = factory.createApp()

router.all('/health', c => c.text('OK', 200))
