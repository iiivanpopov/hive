declare namespace Bun {
  interface Env {
    NODE_ENV: 'production' | 'development'
    DB_URL: string
    FRONTEND_URL: string
    PORT: string
    SMTP_HOST: string
    SMTP_PORT: string
    SMTP_USER: string
    SMTP_PASSWORD: string
  }
}
