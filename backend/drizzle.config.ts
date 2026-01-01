import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/tables/**/*.table.ts',
  out: './drizzle',
  dbCredentials: {
    url: Bun.env.DB_URL,
  },
})
