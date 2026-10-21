import type { H3Event } from '#imports'

export default async function (event: H3Event) {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return session
}
