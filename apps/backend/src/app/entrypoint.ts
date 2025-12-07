import { cors as corsMiddleware } from 'hono/cors'
import { factory } from '@/lib/factory'
import { loggerMiddleware } from '@/middleware/logger.middleware'
import { router } from './router'

const app = factory.createApp()

app.use(corsMiddleware())
app.use(loggerMiddleware())

app.route('/api', router)

export default app
