import { todos } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = getDrizzleDb()

  const body = await readBody(event)

  console.log(body)

  const todo = (await db.insert(todos).values({
    text: body.text,
    ownerId: session.user.id
  }).returning({
    id: todos.id,
    text: todos.text
  }))[0]

  return todo
})
