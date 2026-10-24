<script setup lang="ts">
const { data: session } = await authClient.useSession(useFetch)
</script>

<template>
  <div v-if="session">
    <p>Welcome, {{ session.user.name }}</p>
    <button @click="signOut">
      Sign out
    </button>
  </div>
  <button
    v-else
    @click="authClient.signIn.social({ provider: 'google' })"
  >
    Continue with Google
  </button>
</template>
