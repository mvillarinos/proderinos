<script setup lang="ts">
// Import from unhead
import { useHead } from '@unhead/vue'

// Set page meta
useHead({
  title: 'Villabet - Tournament Management',
  meta: [
    { name: 'description', content: 'Manage your pelota paleta tournaments' }
  ]
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
