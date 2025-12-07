import { cors as corsMiddleware } from 'hono/cors'
import { factory } from '@/lib/factory'
import { errorMiddleware } from '@/middleware/error.middleware'
import { loggerMiddleware } from '@/middleware/logger.middleware'
import { router } from './router'

const app = factory.createApp()

app.onError(errorMiddleware())
app.use(corsMiddleware())
app.use(loggerMiddleware())

app.route('/api', router)

export default app
