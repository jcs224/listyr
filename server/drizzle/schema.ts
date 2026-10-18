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
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' })
})

export const relations = defineRelations({ users, todos }, r => ({
  todos: {
    user: r.one.users({
      from: r.todos.ownerId,
      to: r.users.id
    })
  },

  users: {
    todos: r.many.todos()
  }
}))
