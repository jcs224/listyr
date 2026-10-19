import { todos } from '~~/server/drizzle/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = getDrizzleDb()

  const ownerTodos = await db.select().from(todos).where(eq(todos.ownerId, session.user.id))

  return ownerTodos
})
