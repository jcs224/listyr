import { eq } from 'drizzle-orm'
import { todos } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')

  const db = getDrizzleDb()

  const todoQuery = await db.select().from(todos).where(eq(todos.id, id))

  if (todoQuery.length === 1 && todoQuery[0].ownerId === session.user.id) {
    const body = await readBody(event)

    const todo = await db.update(todos).set(body).where(eq(todos.id, id)).returning({
      id: todos.id,
      text: todos.text,
      completedAt: todos.completedAt
    })

    await nitroApp.hooks.callHook('todo:edit', { user: session.user.id, todo: todo[0] })
  } else {
    throw createError({
      status: 404,
      statusText: 'No record to update'
    })
  }
})
