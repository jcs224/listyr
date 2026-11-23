import { and, eq, ne } from 'drizzle-orm'
import { lists, listUser, users } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')

  if (!await canAccessList(session.user.id, id)) {
    throw createError({
      status: 404,
      statusText: 'No record to read'
    })
  }

  const db = getDrizzleDb()

  const ownerQuery = await db
    .select({ id: users.id, name: users.name, email: users.email, image: users.image })
    .from(lists)
    .innerJoin(users, eq(lists.ownerId, users.id))
    .where(eq(lists.id, id!))

  const sharedUsers = await db
    .select({ id: users.id, name: users.name, email: users.email, image: users.image })
    .from(listUser)
    .innerJoin(users, eq(listUser.userId, users.id))
    .where(and(eq(listUser.listId, id!), ne(listUser.userId, ownerQuery[0]!.id)))

  return {
    owner: ownerQuery[0]!,
    users: sharedUsers
  }
})
