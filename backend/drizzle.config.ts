import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: Bun.env.DB_URL,
  },
})
