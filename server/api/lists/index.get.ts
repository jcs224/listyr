import { lists } from '~~/server/drizzle/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await enforceAuth(event)

  const db = getDrizzleDb()

  const ownerLists = await db.select().from(lists).where(eq(lists.ownerId, session.user.id))

  return ownerLists
})
