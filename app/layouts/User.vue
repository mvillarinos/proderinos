<script setup lang="ts">
// Admin layout that extends the default layout with additional admin-specific features
</script>

<template>
  <NuxtLayout name="default">
    <UContainer class="py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Admin-specific header/breadcrumbs could go here -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-slate-900">Administración</h2>
              <p class="text-slate-600 mt-1">
                Administra torneos, usuarios y configuraciones
              </p>
            </div>
            <UButton
              to="/user"
              variant="outline"
              size="sm"
              class="text-slate-600 hover:text-blue-600 border-slate-300 hover:border-blue-300"
            >
              <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-2" />
              Dashboard
            </UButton>
          </div>
        </div>

        <!-- Admin content -->
        <slot />
      </div>
    </UContainer>
  </NuxtLayout>
</template>
