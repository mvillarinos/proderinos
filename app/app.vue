<script setup lang="ts">
useHead({
  title: "Proderinos - Tu gestión de torneos",
  meta: [
    {
      name: "description",
      content: "Administra todos tus torneos de pelota paleta",
    },
  ],
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
