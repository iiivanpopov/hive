declare namespace Bun {
  interface Env {
    NODE_ENV: 'production' | 'development' | 'test'
    DB_URL: string
    REDIS_URL: string
    GOOGLE_ID: string
    GOOGLE_SECRET: string
    FRONTEND_URL: string
    PORT: string
    SMTP_HOST: string
    SMTP_PORT: string
    SMTP_USER: string
    SMTP_PASSWORD: string
    SMTP_ENABLE: string
  }
}
