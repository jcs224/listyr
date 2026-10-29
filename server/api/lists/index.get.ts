import { lists, listUser } from '~~/server/drizzle/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await enforceAuth(event)

  const db = getDrizzleDb()

  const userLists = await db
    .select({
      id: lists.id,
      name: lists.name,
      createdAt: lists.createdAt,
      updatedAt: lists.updatedAt,
      ownerId: lists.ownerId
    })
    .from(lists)
    .innerJoin(listUser, eq(lists.id, listUser.listId))
    .where(eq(listUser.userId, session.user.id))

  return userLists
})
