import { todos } from '~~/server/drizzle/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await enforceAuth(event)
  const id = getRouterParam(event, 'id')

  const db = getDrizzleDb()

  const listTodos = await db.select().from(todos).where(eq(todos.listId, id))

  const listTodosPrepped = listTodos.map((td) => {
    return {
      ...td,
      completed: td.completedAt ? true : false
    }
  })

  return listTodosPrepped
})
