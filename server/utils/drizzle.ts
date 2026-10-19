import { drizzle } from 'drizzle-orm/tursodatabase/database'

const turso = await getTursoDb()

export function getDrizzleDb() {
  return drizzle({ client: turso })
}
