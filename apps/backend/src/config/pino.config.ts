import { envConfig } from './env.config'

export const pinoConfig = {
  level: envConfig.isDevelopment ? 'debug' : 'info',
}
