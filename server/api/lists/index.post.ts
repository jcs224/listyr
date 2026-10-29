import { lists, listUser } from '~~/server/drizzle/schema'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)
  const db = getDrizzleDb()
  const body = await readBody(event)

  const list = (await db.insert(lists).values({
    name: body.name,
    ownerId: session.user.id
  }).returning({
    id: lists.id,
    name: lists.name
  }))[0]

  await db.insert(listUser).values({
    userId: session.user.id,
    listId: list.id
  })

  await nitroApp.hooks.callHook('list:add', { user: session.user.id, list })
})
