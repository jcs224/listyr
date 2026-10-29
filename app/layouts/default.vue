<script setup lang="ts">
useDark()

const route = useRoute()

const { height } = useWindowSize()

const { data: session } = await authClient.useSession(useFetch)

const { status: sseStatus, data: sseData } = useAuthSse()

const sidebarOpen = ref(true)

const { data: listsInitial } = await useFetch('/api/lists')
const lists = ref(listsInitial.value)

const listsMenu = computed(() => {
  const userLists = lists.value.map(ls => ({
    id: ls.id,
    label: ls.name,
    icon: 'i-lucide-clipboard-list',
    to: `/${ls.id}`
  }))

  return [
    {
      label: 'Default',
      icon: 'i-lucide-home',
      to: '/',
      active: !route.params.list_id
    },
    ...userLists
  ]
})

// Add list
const newListModalOpen = ref(false)
const newListName = ref('')

async function addList() {
  await $fetch('/api/lists', {
    method: 'post',
    body: {
      name: newListName.value
    }
  })

  newListModalOpen.value = false
  newListName.value = ''
}

// Delete list
const deleteListId = ref('')
const deleteListModalOpen = ref(false)

async function deleteList() {
  await $fetch('/api/lists/' + deleteListId.value, {
    method: 'delete'
  })

  deleteListId.value = ''
}

watch(deleteListId, (value) => {
  if (value) {
    deleteListModalOpen.value = true
  } else {
    deleteListModalOpen.value = false
  }
})

watch(deleteListModalOpen, (value) => {
  if (!value) {
    deleteListId.value = ''
  }
})

// Edit list
const editListId = ref('')
const editListName = ref('')
const editListModalOpen = ref(false)

watch(editListId, (value) => {
  if (value) {
    editListModalOpen.value = true
    editListName.value = lists.value.filter(ls => ls.id === value)[0].name
  } else {
    editListModalOpen.value = false
  }
})

watch(editListModalOpen, (value) => {
  if (!value) {
    editListId.value = ''
  }
})

function afterEditModalLeave() {
  editListName.value = ''
}

async function updateList() {
  await $fetch('/api/lists/' + editListId.value, {
    method: 'put',
    body: {
      name: editListName.value
    }
  })

  editListModalOpen.value = false
}

// Share list

const shareListId = ref('')
const shareListEmail = ref('')
const shareListModalOpen = ref(false)

async function shareList() {
  await $fetch('/api/lists/' + shareListId.value + '/share', {
    method: 'put',
    body: {
      email: shareListEmail.value
    }
  })

  shareListModalOpen.value = false
}

watch(shareListId, (value) => {
  if (value) {
    shareListModalOpen.value = true
  } else {
    shareListModalOpen.value = false
  }
})

watch(shareListModalOpen, (value) => {
  if (!value) {
    shareListId.value = ''
  }
})

watch(sseData, (value) => {
  const { event, payload } = JSON.parse(value)

  switch (event) {
    case 'list:add': {
      lists.value.push(payload)
      break
    }

    case 'list:edit': {
      const listIndex = lists.value.findIndex(ls => ls.id === payload.id)
      lists.value[listIndex].name = payload.name
      break
    }

    case 'list:delete': {
      const listIndex = lists.value.findIndex(ls => ls.id === payload.id)
      lists.value.splice(listIndex, 1)
      break
    }

    case 'list:share': {
      lists.value.push(payload)
    }
  }
})
</script>

<template>
  <UApp>
    <div
      ref="containerRef"
      class="flex flex-col"
      :style="`height: ${height}px;`"
    >
      <div class="flex items-center gap-2 lg:hidden self-start h-12">
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="sidebarOpen = true"
        />
      </div>
      <div class="flex-1 flex min-h-0">
        <USidebar
          v-model:open="sidebarOpen"
        >
          <UNavigationMenu
            :items="listsMenu"
            orientation="vertical"
          >
            <template #item-trailing="{ item }">
              <UDropdownMenu
                v-if="item.id"
                :items="[
                  {
                    label: 'Edit',
                    icon: 'i-lucide-pencil',
                    onSelect: () => { editListId = item.id }
                  },
                  {
                    label: 'Delete',
                    icon: 'i-lucide-trash',
                    onSelect: () => { deleteListId = item.id }
                  },
                  {
                    label: 'Share',
                    icon: 'i-lucide-user',
                    onSelect: () => { shareListId = item.id }
                  }
                ]"
              >
                <UButton
                  icon="i-lucide-ellipsis-vertical"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  aria-label="List actions"
                />
              </UDropdownMenu>
            </template>
          </UNavigationMenu>

          <UButton
            label="Create list"
            icon="i-lucide-plus"
            class="flex justify-center"
            @click="newListModalOpen = true"
          />

          <template #footer>
            <div v-if="session">
              <UUser
                :name="session.user.name"
                :avatar="{ src: session.user.image ?? undefined, alt: session.user.name }"
                size="sm"
                class="w-full"
              />

              <UButton
                label="Sign Out"
                @click="signOut"
              />
            </div>
            <UButton
              v-else
              label="Login with Google"
            />
          </template>
        </USidebar>
        <div class="flex-1 min-w-0 overflow-y-auto">
          <slot />
        </div>
      </div>
    </div>

    <UModal
      v-model:open="deleteListModalOpen"
      title="Delete list"
      :ui="{ overlay: 'z-[60]', content: 'z-[60]' }"
    >
      <template #body>
        Are you sure you want to delete the list item? This action cannot be undone!
      </template>

      <template #footer>
        <UButton
          color="error"
          label="Delete"
          @click="deleteList"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="editListModalOpen"
      title="Edit list"
      :ui="{ overlay: 'z-[60]', content: 'z-[60]' }"
      @after:leave="afterEditModalLeave"
    >
      <template #body>
        <UForm
          :state="{ name: editListName }"
          class="flex flex-col items-end gap-2"
          @submit="updateList"
        >
          <UInput
            v-model="editListName"
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
      v-model:open="newListModalOpen"
      title="New list"
      :ui="{ overlay: 'z-[60]', content: 'z-[60]' }"
    >
      <template #body>
        <UForm
          :state="{ name: newListName }"
          class="flex flex-col items-end gap-2"
          @submit="addList"
        >
          <UInput
            ref="newListInput"
            v-model="newListName"
            class="w-full"
            placeholder="Groceries..."
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
      v-model:open="shareListModalOpen"
      title="Share list"
      :ui="{ overlay: 'z-[60]', content: 'z-[60]' }"
    >
      <template #body>
        <UForm
          :state="{ email: shareListEmail }"
          class="flex flex-col items-end gap-2"
          @submit="shareList"
        >
          <UInput
            ref="shareListInput"
            v-model="shareListEmail"
            class="w-full"
            placeholder="joe@example.com"
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
  </UApp>
</template>
