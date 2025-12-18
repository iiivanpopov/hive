export const envConfig = {
  nodeEnv: Bun.env.NODE_ENV ?? 'production',
  isProduction: Bun.env.NODE_ENV === 'production',
  isDevelopment: Bun.env.NODE_ENV === 'development',
}
