import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import envPaths from 'env-paths'
import { join } from 'node:path'

export default defineConfig({
  out: './server/drizzle/migrations',
  schema: './server/drizzle/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: join(envPaths('listyr').data, 'listyr.sqlite')!
  }
})
