import type { lists, todos } from '~~/server/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { lists as listsTable, listUser } from '~~/server/drizzle/schema'

type TodoPayload = Partial<typeof todos.$inferSelect> | undefined

/**
 * Returns true if the user may see events for a list:
 * either they are a member via the list_user table, or they own the list.
 */
export async function canAccessList(userId: string, listId?: string | null) {
  if (!listId) {
    return false
  }

  const db = getDrizzleDb()

  const member = await db
    .select()
    .from(listUser)
    .where(and(eq(listUser.listId, listId), eq(listUser.userId, userId)))

  if (member.length > 0) {
    return true
  }

  const owner = await db
    .select({ ownerId: listsTable.ownerId })
    .from(listsTable)
    .where(eq(listsTable.id, listId))

  return owner.length === 1 && owner[0]!.ownerId === userId
}

/**
 * Returns true if the user may see an event about a todo:
 * membership or ownership of the todo's list, or (for list-less todos)
 * being the user that acted on the todo.
 */
export function canSeeTodo(userId: string, user: string, todo: TodoPayload) {
  if (todo?.listId) {
    return canAccessList(userId, todo.listId)
  }

  return userId === user
}

/**
 * Returns true if the user may toggle a todo's completion:
 * they own the todo, or they can access its list (member or list owner).
 */
export async function canToggleTodo(userId: string, ownerId: string, listId?: string | null) {
  if (userId === ownerId) {
    return true
  }

  return canAccessList(userId, listId)
}

declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    'todo:add': (data: { user: string, todo: Partial<typeof todos.$inferSelect> }) => void | Promise<void>
    'todo:edit': (data: { user: string, todo: Partial<typeof todos.$inferSelect> }) => void | Promise<void>
    'todo:delete': (data: { user: string, todo: { id: string, listId?: string | null } }) => void | Promise<void>
    'todo:toggle': (data: { user: string, todo: Partial<typeof todos.$inferSelect> }) => void | Promise<void>
    'list:add': (data: { user: string, list: Partial<typeof lists.$inferSelect> }) => void | Promise<void>
    'list:edit': (data: { user: string, list: Partial<typeof lists.$inferSelect> }) => void | Promise<void>
    'list:delete': (data: { user: string, list: { id: string } }) => void | Promise<void>
    'list:share': (data: { initiator: string, receiver: string, list: Partial<typeof lists.$inferSelect> }) => void | Promise<void>
  }
}
