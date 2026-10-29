export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const session = await enforceAuth(event)
  const eventStream = createEventStream(event)

  nitroApp.hooks.hook('todo:add', async (data) => {
    if (session.user.id === data.user) {
      await eventStream.push(JSON.stringify({ event: 'todo:add', payload: data.todo }))
    }
  })

  nitroApp.hooks.hook('todo:edit', async (data) => {
    if (session.user.id === data.user) {
      await eventStream.push(JSON.stringify({ event: 'todo:edit', payload: data.todo }))
    }
  })

  nitroApp.hooks.hook('todo:delete', async (data) => {
    if (session.user.id === data.user) {
      await eventStream.push(JSON.stringify({ event: 'todo:delete', payload: data.todo }))
    }
  })

  nitroApp.hooks.hook('todo:toggle', async (data) => {
    if (session.user.id === data.user) {
      await eventStream.push(JSON.stringify({ event: 'todo:toggle', payload: data.todo }))
    }
  })

  nitroApp.hooks.hook('list:add', async (data) => {
    if (session.user.id === data.user) {
      await eventStream.push(JSON.stringify({ event: 'list:add', payload: data.list }))
    }
  })

  nitroApp.hooks.hook('list:edit', async (data) => {
    if (session.user.id === data.user) {
      await eventStream.push(JSON.stringify({ event: 'list:edit', payload: data.list }))
    }
  })

  nitroApp.hooks.hook('list:delete', async (data) => {
    if (session.user.id === data.user) {
      await eventStream.push(JSON.stringify({ event: 'list:delete', payload: data.list }))
    }
  })

  nitroApp.hooks.hook('list:share', async (data) => {
    if (session.user.id === data.receiver) {
      await eventStream.push(JSON.stringify({ event: 'list:share', payload: data.list }))
    }
  })

  eventStream.onClosed(async () => {
    await eventStream.close()
  })

  return eventStream.send()
})
