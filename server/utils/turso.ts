import { connect } from '@tursodatabase/database'

if (!process.env.DB_FILE_NAME) {
  throw new Error('DB_FILE_NAME is not set')
}

const db = await connect(process.env.DB_FILE_NAME, {
  experimental: ['multiprocess_wal']
})

export async function getTursoDb() {
  return db
}
