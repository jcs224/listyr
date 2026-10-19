import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2'
import { getTursoDb } from './turso'
import { getDrizzleDb } from './drizzle'
import * as authSchema from '../drizzle/auth-schema'

const config = useRuntimeConfig()

export const auth = betterAuth({
  database: drizzleAdapter(getDrizzleDb(), {
    provider: 'sqlite',
    schema: authSchema,
    usePlural: true
  }),
  socialProviders: {
    google: {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret
    }
  }
})
