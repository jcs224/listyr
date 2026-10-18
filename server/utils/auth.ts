import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { getTursoDb } from './turso'
import { getDrizzleDb } from './drizzle'
import * as authSchema from '../drizzle/auth-schema'

const turso = await getTursoDb()

export const auth = betterAuth({
  database: drizzleAdapter(getDrizzleDb(turso), {
    provider: 'sqlite',
    schema: authSchema
  })
})
