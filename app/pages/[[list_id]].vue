<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()

const { data: session } = await authClient.useSession(useFetch)

const { status: sseStatus, data: sseData } = useAuthSse()

// Load todos

let todoRoute = '/api/todos'

if (route.params.list_id) {
  todoRoute = '/api/lists/' + route.params.list_id + '/todos'
}

const { data: todosInitial } = await useFetch(todoRoute)
const todos = ref(todosInitial.value)

// Add todo
const newTodoText = ref('')
const newTodoModalOpen = ref(false)
const newTodoInput = useTemplateRef('newTodoInput')

async function addTodo() {
  const listId = route.params.list_id || null

  const todo = await $fetch('/api/todos',
    {
      method: 'post',
      body: {
        text: newTodoText.value,
        listId
      }
    }
  )

  newTodoText.value = ''
  setTimeout(() => {
    newTodoInput.value?.inputRef?.focus()
  }, 0)
}

// Delete todo
const deleteTodoId = ref('')
const deleteTodoModalOpen = ref(false)

async function deleteTodo() {
  await $fetch('/api/todos/' + deleteTodoId.value, {
    method: 'delete'
  })

  deleteTodoId.value = ''
}

watch(deleteTodoId, (value: string) => {
  if (value) {
    deleteTodoModalOpen.value = true
  } else {
    deleteTodoModalOpen.value = false
  }
})

watch(deleteTodoModalOpen, (value: boolean) => {
  if (!value) {
    deleteTodoId.value = ''
  }
})

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
  await $fetch('/api/todos/' + editTodoId.value, {
    method: 'put',
    body: {
      text: editTodoText.value
    }
  })

  editTodoModalOpen.value = false
}

// Complete/uncomplete todo

async function toggleTodo(id: string) {
  await $fetch(`/api/todos/${id}/toggle`, {
    method: 'put'
  })
}

watch(sseData, (value) => {
  const { event, payload } = JSON.parse(value)

  switch (event) {
    case 'todo:add': {
      todos.value.push(payload)
      break
    }

    case 'todo:edit': {
      const todoIndex = todos.value.findIndex(td => td.id === payload.id)
      todos.value[todoIndex].text = payload.text
      break
    }

    case 'todo:delete': {
      const todoIndex = todos.value.findIndex(td => td.id === payload.id)
      todos.value.splice(todoIndex, 1)
      break
    }

    case 'todo:toggle': {
      const todoIndex = todos.value.findIndex(td => td.id === payload.id)
      todos.value[todoIndex].completedAt = payload.completedAt
    }
  }
})
</script>

<template>
  <div>
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
        <div class="flex items-center gap-2">
          <UCheckbox
            :model-value="!!todo.completedAt"
            @change="toggleTodo(todo.id)"
          />
          <span
            :class="{ 'line-through text-muted': !!todo.completedAt }"
            class="cursor-pointer select-none"
            @click="toggleTodo(todo.id)"
          >{{ todo.text }}</span>
        </div>
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
            @click="deleteTodoId = todo.id"
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
            :autofocus="true"
          />

          <UButton
            type="submit"
            label="Update"
          />
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="deleteTodoModalOpen"
      title="Delete todo"
    >
      <template #body>
        Are you sure you want to delete this todo? This action cannot be undone.
      </template>

      <template #footer>
        <UButton
          color="error"
          label="Delete"
          @click="deleteTodo"
        />
      </template>
    </UModal>
  </div>
</template>
