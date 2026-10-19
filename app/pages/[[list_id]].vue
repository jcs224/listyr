<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: session } = await authClient.useSession(useFetch)

const { data: todosInitial } = await useFetch('/api/posts')
const todos = ref(todosInitial.value)

const newTodo = ref('')

async function addTodo() {
  const todo = await $fetch('/api/posts',
    {
      method: 'post',
      body: {
        text: newTodo.value
      }
    }
  )

  todos.value.push(todo)
}
</script>

<template>
  <div>
    <h1>{{ session.user.name }}'s todos</h1>

    <UInput v-model="newTodo" />

    <UButton
      label="add todo"
      @click="addTodo"
    />

    <ul
      v-for="todo in todos"
      :key="todo.id"
    >
      <li>{{ todo.text }}</li>
    </ul>
  </div>
</template>
