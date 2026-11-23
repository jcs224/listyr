import { and, eq } from 'drizzle-orm'
import { lists, listUser } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')

  const db = getDrizzleDb()

  const listQuery = await db.select().from(lists).where(eq(lists.id, id!))

  if (listQuery.length === 1 && listQuery[0]!.ownerId === session.user.id) {
    if (userId === listQuery[0]!.ownerId) {
      throw createError({
        status: 400,
        statusText: 'Cannot remove the owner of a list'
      })
    }

    const deleted = await db
      .delete(listUser)
      .where(and(eq(listUser.listId, id!), eq(listUser.userId, userId!)))
      .returning()

    if (deleted.length === 0) {
      throw createError({
        status: 404,
        statusText: 'No record to delete'
      })
    }

    setResponseStatus(event, 204)

    await nitroApp.hooks.callHook('list:unshare', { initiator: session.user.id, receiver: userId!, list: { id: id! } })
  } else {
    throw createError({
      status: 404,
      statusText: 'No record to delete'
    })
  }
})
