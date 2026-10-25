import { eq } from 'drizzle-orm'
import { todos } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')

  const db = getDrizzleDb()

  const todoQuery = await db.select().from(todos).where(eq(todos.id, id))

  if (todoQuery.length === 1 && todoQuery[0].ownerId === session.user.id) {
    let newCompletedValue = null

    if (todoQuery[0].completedAt) {
      newCompletedValue = null
    } else {
      newCompletedValue = new Date().toISOString()
    }

    const todo = await db.update(todos).set({
      completedAt: newCompletedValue
    }).where(eq(todos.id, id)).returning({
      id: todos.id,
      completedAt: todos.completedAt
    })

    await nitroApp.hooks.callHook('todo:toggle', { user: session.user.id, todo: todo[0] })
  } else {
    throw createError({
      status: 404,
      statusText: 'No record to update'
    })
  }
})
