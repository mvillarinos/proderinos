<script setup lang="ts">
useHead({
  title: 'Proderinos - Tournament Management',
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
