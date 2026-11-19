import { and, eq } from 'drizzle-orm'
import { lists, listUser, todos } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)

  const db = getDrizzleDb()

  const body = await readBody(event)

  if (body.listId) {
    const listQuery = await db.select().from(lists).where(eq(lists.id, body.listId))

    const isOwner = listQuery.length === 1 && listQuery[0]!.ownerId === session.user.id
    const isMember = !isOwner && (await db
      .select({ listId: listUser.listId })
      .from(listUser)
      .where(and(eq(listUser.listId, body.listId), eq(listUser.userId, session.user.id)))).length > 0

    if (!isOwner && !isMember) {
      throw createError({
        status: 404,
        statusText: 'List not found'
      })
    }
  }

  const todo = (await db.insert(todos).values({
    text: body.text,
    ownerId: session.user.id,
    listId: body.listId
  }).returning({
    id: todos.id,
    text: todos.text,
    listId: todos.listId
  }))[0]!

  await nitroApp.hooks.callHook('todo:add', { user: session.user.id, todo })
})
