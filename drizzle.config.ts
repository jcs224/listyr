import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './server/drizzle/migrations',
  schema: './server/drizzle/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!
  }
})
