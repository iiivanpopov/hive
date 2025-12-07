import path from 'node:path'
import process from 'node:process'

export const dbConfig = {
  url: path.resolve(process.cwd(), import.meta.env.DB_URL!),
}
