import { drizzle } from 'drizzle-orm/tursodatabase/database'
import type { Database } from '@tursodatabase/database'

export function getDrizzleDb(client: Database) {
  return drizzle({ client })
}
