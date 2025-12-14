type NODE_ENV = 'production' | 'development'

declare namespace Bun {
  interface Env {
    NODE_ENV: NODE_ENV
    DB_URL: string
  }
}
