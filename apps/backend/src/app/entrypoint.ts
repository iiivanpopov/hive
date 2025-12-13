import { Scalar } from '@scalar/hono-api-reference'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { describeRoute, openAPIRouteHandler, resolver } from 'hono-openapi'
import { cors } from 'hono/cors'
import z from 'zod'
import { serverConfig } from '@/config/server.config'
import { db } from '@/db/instance'
import { factory } from '@/lib/factory'
import { pino } from '@/lib/pino'
import { error } from '@/middleware/error.middleware'
import { logger } from '@/middleware/logger.middleware'
import { router } from './router'

migrate(db, { migrationsFolder: './drizzle' })
pino.info('migrate finished')

const app = factory.createApp()
  .onError(error())
  .use(cors())
  .use(logger())
  .route('/api', router)
  .get('/health', describeRoute({
    description: 'Health check',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(z.object({
              status: z.literal('ok'),
            })),
          },
        },
      },
    },
  }), c => c.json({ status: 'ok' }))

app.get('/openapi', openAPIRouteHandler(app, {
  documentation: {
    info: {
      title: 'Hive API',
      version: '0.0.0',
      description: 'API documentation for Hive backend',
    },
    servers: [
      { url: `http://localhost:${serverConfig.port}` },
    ],
  },
}))
app.get('/docs', Scalar({ url: '/openapi' }))

export default app
