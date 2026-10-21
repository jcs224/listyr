import { eq } from 'drizzle-orm'
import { todos } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')

  const db = getDrizzleDb()

  const todoQuery = await db.select().from(todos).where(eq(todos.id, id))

  if (todoQuery.length === 1 && todoQuery[0].ownerId === session.user.id) {
    await db.delete(todos).where(eq(todos.id, id))

    setResponseStatus(event, 204)

    return null
  } else {
    throw createError({
      status: 404,
      statusText: 'No record to delete'
    })
  }
})
