import type { NODE_ENV } from '@/types'

export const envConfig = {
  nodeEnv: import.meta.env.NODE_ENV as NODE_ENV,
  isProduction: import.meta.env.NODE_ENV === 'production',
  isDevelopment: import.meta.env.NODE_ENV === 'development',
}
