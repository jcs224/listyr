<script setup>
const { height } = useWindowSize()

const { data: session } = await authClient.useSession(useFetch)

const sidebarOpen = ref(true)
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
                @click="signOut()"
              />
            </div>
            <UButton
              v-else
              label="Login with Google"
            />
          </template>
        </USidebar>
        <div class="flex-1 min-w-0 overflow-y-auto">
          <NuxtPage />
        </div>
      </div>
    </div>
  </UApp>
</template>
