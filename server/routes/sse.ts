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

  eventStream.onClosed(async () => {
    await eventStream.close()
  })

  return eventStream.send()
})
