import { todos } from '~~/server/drizzle/schema'
import { eq, and, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await enforceAuth(event)

  const db = getDrizzleDb()

  const ownerTodos = await db.select().from(todos).where(
    and(
      eq(todos.ownerId, session.user.id),
      isNull(todos.listId)
    )
  )

  const ownerTodosPrepped = ownerTodos.map((td) => {
    return {
      ...td,
      completed: td.completedAt ? true : false
    }
  })

  return ownerTodosPrepped
})
