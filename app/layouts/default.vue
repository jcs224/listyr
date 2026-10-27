<script setup>
useDark()

const { height } = useWindowSize()

const { data: session } = await authClient.useSession(useFetch)

const { status: sseStatus, data: sseData } = useAuthSse()

const sidebarOpen = ref(true)

const { data: listsInitial } = await useFetch('/api/lists')
const lists = ref(listsInitial.value)

const listsMenu = computed(() => {
  return lists.value.map(ls => ({
    label: ls.name,
    icon: 'i-lucide-clipboard-list'
  }))
})

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

watch(sseData, (value) => {
  const { event, payload } = JSON.parse(value)

  switch (event) {
    case 'list:add': {
      lists.value.push(payload)
      break
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
          />

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
      v-model:open="newListModalOpen"
      title="New list"
      :ui="{ overlay: 'z-[60]', content: 'z-[60]' }"
    >
      <template #body>
        <UForm
          :state="{ text: newListName }"
          class="flex flex-col items-end gap-2"
          @submit="addList"
        >
          <UInput
            ref="newTodoInput"
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
  </UApp>
</template>
