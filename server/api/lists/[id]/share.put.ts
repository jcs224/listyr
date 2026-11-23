import { eq } from 'drizzle-orm'
import { lists, listUser, users } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const db = getDrizzleDb()

  const listQuery = await db.select().from(lists).where(eq(lists.id, id!))

  if (listQuery.length === 1 && listQuery[0]!.ownerId === session.user.id) {
    const userQuery = await db.select().from(users).where(eq(users.email, body.email))

    if (userQuery.length === 0) {
      throw createError({
        status: 404,
        statusText: 'No user with that email'
      })
    }

    const userId = userQuery[0]!.id

    if (userId === session.user.id) {
      throw createError({
        status: 400,
        statusText: 'Cannot share a list with yourself'
      })
    }

    const inserted = await db
      .insert(listUser)
      .values({
        listId: id!,
        userId
      })
      .onConflictDoNothing()
      .returning()

    if (inserted.length === 0) {
      throw createError({
        status: 409,
        statusText: 'List is already shared with that user'
      })
    }

    await nitroApp.hooks.callHook('list:share', { initiator: session.user.id, receiver: userId, list: listQuery[0]! })

    return {
      id: userId,
      name: userQuery[0]!.name,
      email: userQuery[0]!.email,
      image: userQuery[0]!.image
    }
  } else {
    throw createError({
      status: 404,
      statusText: 'No record to update'
    })
  }
})
