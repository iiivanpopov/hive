import { pino } from 'pino'
import { envConfig } from '@/config/env.config'
import { pinoConfig } from '@/config/pino.config'

const instance = pino({
  level: pinoConfig.level,
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
