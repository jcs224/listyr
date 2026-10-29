import { v7 as uuidv7 } from 'uuid'
import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core'
import { users } from './auth-schema'
import { defineRelations } from 'drizzle-orm'

export * from './auth-schema'

export const todos = sqliteTable('todos', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  text: text('text').notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .$defaultFn(() => new Date()
      .toISOString())
    .$onUpdateFn(() => new Date()
      .toISOString()),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  listId: text('list_id').references(() => lists.id, { onDelete: 'cascade' })
})

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),

  name: text('name').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .$defaultFn(() => new Date()
      .toISOString())
    .$onUpdateFn(() => new Date()
      .toISOString()),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' })
})

export const listUser = sqliteTable('list_user', {
  listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' })
}, t => [primaryKey({ columns: [t.listId, t.userId] })])

export const relations = defineRelations({ users, todos, lists, listUser }, r => ({
  todos: {
    user: r.one.users({
      from: r.todos.ownerId,
      to: r.users.id
    }),

    list: r.one.lists({
      from: r.todos.listId,
      to: r.lists.id
    })
  },

  users: {
    todos: r.many.todos(),
    lists: r.many.lists({
      from: r.users.id.through(r.listUser.userId),
      to: r.lists.id.through(r.listUser.listId)
    })
  },

  lists: {
    todos: r.many.todos(),
    users: r.many.users({
      from: r.lists.id.through(r.listUser.listId),
      to: r.users.id.through(r.listUser.userId)
    })
  }
}))
