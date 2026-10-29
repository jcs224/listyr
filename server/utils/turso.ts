import { connect } from '@tursodatabase/database'

if (!process.env.DB_FILE_NAME) {
  throw new Error('DB_FILE_NAME is not set')
}

const db = await connect(process.env.DB_FILE_NAME, {
  experimental: ['multiprocess_wal']
})

// SQLite enforces foreign keys (and ON DELETE CASCADE) only when this
// per-connection pragma is enabled. @tursodatabase/database does not do it
// automatically, so we have to enable it explicitly.
await db.exec('PRAGMA foreign_keys = ON')

export async function getTursoDb() {
  return db
}
