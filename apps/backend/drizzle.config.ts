import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schemas/*',
  out: './drizzle',
  dbCredentials: {
    url: Bun.env.DB_URL,
  },
})
