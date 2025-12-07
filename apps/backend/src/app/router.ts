import { factory } from '@/lib/factory'

const router = factory.createApp()

router.all('/health', c => c.text('OK', 200))

export { router }
