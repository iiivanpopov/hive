import { pino } from 'pino'
import { envConfig } from '@/config/env.config'

const instance = pino({
  level: envConfig.isDevelopment ? 'debug' : 'info',
  transport: envConfig.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})

export { instance as pino }
