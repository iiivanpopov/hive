import { cors as corsMiddleware } from 'hono/cors'
import { factory } from '@/lib/factory'
import { router } from './router'

const app = factory.createApp()

app.use(corsMiddleware())

app.route('/api', router)

export default app
