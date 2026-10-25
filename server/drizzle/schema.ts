import { v7 as uuidv7 } from 'uuid'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
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

export const relations = defineRelations({ users, todos, lists }, r => ({
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
    todos: r.many.todos()
  },

  lists: {
    todos: r.many.todos()
  }
}))
