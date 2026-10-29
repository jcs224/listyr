import { eq } from 'drizzle-orm'
import { lists, listUser, users } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const db = getDrizzleDb()

  const listQuery = await db.select().from(lists).where(eq(lists.id, id))
  const userId = (await db.select().from(users).where(eq(users.email, body.email)))[0].id

  if (listQuery.length === 1 && listQuery[0].ownerId === session.user.id) {
    await db.insert(listUser).values({
      listId: id,
      userId
    })

    await nitroApp.hooks.callHook('list:share', { initiator: session.user.id, receiver: userId, list: listQuery[0] })
  } else {
    throw createError({
      status: 404,
      statusText: 'No record to update'
    })
  }
})
