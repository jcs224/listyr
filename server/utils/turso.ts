import { connect } from '@tursodatabase/database'
import { join } from 'node:path'
import { stat, mkdir } from 'node:fs/promises'

import envPaths from 'env-paths'

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await stat(dirPath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

const appPath = envPaths('listyr').data
const dbPath = join(appPath, 'listyr.sqlite')

if (!await directoryExists(appPath)) {
  await mkdir(appPath)
}

const db = await connect(dbPath, {
  experimental: ['multiprocess_wal']
})

// SQLite enforces foreign keys (and ON DELETE CASCADE) only when this
// per-connection pragma is enabled. @tursodatabase/database does not do it
// automatically, so we have to enable it explicitly.
await db.exec('PRAGMA foreign_keys = ON')

export async function getTursoDb() {
  return db
}
