<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: session } = await authClient.useSession(useFetch)

// Load todos
const { data: todosInitial } = await useFetch('/api/posts')
const todos = ref(todosInitial.value)

// Add todo
const newTodoText = ref('')
const newTodoModalOpen = ref(false)
const newTodoInput = useTemplateRef('newTodoInput')

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

  newTodoText.value = ''
  setTimeout(() => {
    newTodoInput.value?.inputRef?.focus()
  }, 0)
}

// Delete todo
async function deleteTodo(id: string) {
  await $fetch('/api/posts/' + id, {
    method: 'delete'
  })

  const todoIndex = todos.value.findIndex(td => td.id === id)
  todos.value.splice(todoIndex, 1)
}

// Edit todo
const editTodoId = ref('')
const editTodoText = ref('')
const editTodoModalOpen = ref(false)

watch(editTodoId, (value: string) => {
  if (value) {
    editTodoModalOpen.value = true
    editTodoText.value = todos.value.filter(td => td.id === value)[0].text
  } else {
    editTodoModalOpen.value = false
  }
})

watch(editTodoModalOpen, (value: boolean) => {
  if (!value) {
    editTodoId.value = ''
  }
})

function afterEditModalLeave() {
  editTodoText.value = ''
}

async function updateTodo() {
  const updatedTodo = await $fetch('/api/posts/' + editTodoId.value, {
    method: 'put',
    body: {
      text: editTodoText.value
    }
  })

  if (updatedTodo) {
    const todoIndex = todos.value.findIndex(td => td.id === editTodoId.value)
    todos.value[todoIndex].text = updatedTodo.text
    editTodoModalOpen.value = false
  }
}
</script>

<template>
  <div>
    <h1>{{ session.user.name }}'s todos</h1>

    <!-- <ul
      v-for="todo in todos"
      :key="todo.id"
    >
      <li>{{ todo.text }}</li>
    </ul> -->

    <div class="flex flex-col gap-2 p-2">
      <div
        v-for="todo in todos"
        :key="todo.id"
        class="flex justify-between w-full p-2 border border-muted rounded"
      >
        {{ todo.text }}
        <div class="flex gap-2">
          <UButton
            size="xs"
            color="info"
            icon="i-lucide-pencil"
            @click="editTodoId = todo.id"
          />
          <UButton
            size="xs"
            color="error"
            icon="i-lucide-x"
            @click="deleteTodo(todo.id)"
          />
        </div>
      </div>
    </div>

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
            ref="newTodoInput"
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

    <UModal
      v-model:open="editTodoModalOpen"
      title="Edit todo"
      @after:leave="afterEditModalLeave"
    >
      <template #body>
        <UForm
          :state="{ text: editTodoText }"
          class="flex flex-col items-end gap-2"
          @submit="updateTodo"
        >
          <UInput
            v-model="editTodoText"
            class="w-full"
            autofocus="true"
          />

          <UButton
            type="submit"
            label="Update"
          />
        </UForm>
      </template>
    </UModal>
  </div>
</template>
