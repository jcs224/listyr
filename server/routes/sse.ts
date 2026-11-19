export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)
  const eventStream = createEventStream(event)

  async function push(name: string, payload: unknown) {
    await eventStream.push(JSON.stringify({ event: name, payload }))
  }

  nitroApp.hooks.hook('todo:add', async (data) => {
    if (await canSeeTodo(session.user.id, data.user, data.todo)) {
      await push('todo:add', data.todo)
    }
  })

  nitroApp.hooks.hook('todo:edit', async (data) => {
    if (await canSeeTodo(session.user.id, data.user, data.todo)) {
      await push('todo:edit', data.todo)
    }
  })

  nitroApp.hooks.hook('todo:delete', async (data) => {
    if (await canSeeTodo(session.user.id, data.user, data.todo)) {
      await push('todo:delete', data.todo)
    }
  })

  nitroApp.hooks.hook('todo:toggle', async (data) => {
    if (await canSeeTodo(session.user.id, data.user, data.todo)) {
      await push('todo:toggle', data.todo)
    }
  })

  nitroApp.hooks.hook('list:add', async (data) => {
    if (session.user.id === data.user) {
      await push('list:add', data.list)
    }
  })

  nitroApp.hooks.hook('list:edit', async (data) => {
    if (await canAccessList(session.user.id, data.list.id)) {
      await push('list:edit', data.list)
    }
  })

  nitroApp.hooks.hook('list:delete', async (data) => {
    if (await canAccessList(session.user.id, data.list.id)) {
      await push('list:delete', data.list)
    }
  })

  nitroApp.hooks.hook('list:share', async (data) => {
    if (session.user.id === data.receiver || await canAccessList(session.user.id, data.list.id)) {
      await push('list:share', data.list)
    }
  })

  eventStream.onClosed(async () => {
    await eventStream.close()
  })

  return eventStream.send()
})
