import { eq } from 'drizzle-orm'
import { lists } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')

  const db = getDrizzleDb()

  const listQuery = await db.select().from(lists).where(eq(lists.id, id))

  if (listQuery.length === 1 && listQuery[0].ownerId === session.user.id) {
    const body = await readBody(event)

    const list = await db.update(lists).set(body).where(eq(lists.id, id)).returning({
      id: lists.id,
      name: lists.name
    })

    await nitroApp.hooks.callHook('list:edit', { user: session.user.id, list: list[0] })
  } else {
    throw createError({
      status: 404,
      statusText: 'No record to update'
    })
  }
})
