import { eq } from 'drizzle-orm'
import { lists } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')

  const db = getDrizzleDb()

  const listQuery = await db.select().from(lists).where(eq(lists.id, id))

  if (listQuery.length === 1 && listQuery[0].ownerId === session.user.id) {
    await db.delete(lists).where(eq(lists.id, id))

    setResponseStatus(event, 204)

    await nitroApp.hooks.callHook('list:delete', { user: session.user.id, list: { id } })
  } else {
    throw createError({
      status: 404,
      statusText: 'No record to delete'
    })
  }
})
