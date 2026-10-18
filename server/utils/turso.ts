import { connect } from '@tursodatabase/database'

const db = await connect(process.env.DB_FILE_NAME, {
  experimental: ['multiprocess_wal']
})

export async function getTursoDb() {
  return db
}
