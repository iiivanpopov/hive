import { defineConfig } from 'drizzle-kit'
import { dbConfig } from '@/config/db.config'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: dbConfig,
})
