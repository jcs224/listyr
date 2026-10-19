<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: session } = await authClient.useSession(useFetch)

const { data: todosInitial } = await useFetch('/api/posts')
const todos = ref(todosInitial.value)

const newTodoText = ref('')
const newTodoModalOpen = ref(false)

async function addTodo() {
  const todo = await $fetch('/api/posts',
    {
      method: 'post',
      body: {
        text: newTodoText.value
      }
    }
  )

  todos.value.push(todo)
}
</script>

<template>
  <div>
    <h1>{{ session.user.name }}'s todos</h1>

    <ul
      v-for="todo in todos"
      :key="todo.id"
    >
      <li>{{ todo.text }}</li>
    </ul>

    <UButton
      icon="i-lucide-plus"
      size="xl"
      color="primary"
      variant="solid"
      class="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
      @click="newTodoModalOpen = true"
    />

    <UModal
      v-model:open="newTodoModalOpen"
      title="New todo"
    >
      <template #body>
        <UForm
          :state="{ text: newTodoText }"
          class="flex flex-col items-end gap-2"
          @submit="addTodo"
        >
          <UInput
            v-model="newTodoText"
            class="w-full"
            placeholder="Pair of socks..."
            :autofocus="true"
          />

          <UButton
            type="submit"
            icon="i-lucide-plus"
            label="Add"
          />
        </UForm>
      </template>
    </UModal>
  </div>
</template>
