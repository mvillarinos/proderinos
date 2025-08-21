<script setup lang="ts">
defineProps<{
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    role?: string | null;
    dbId?: string | number;
  };
}>();
const emit = defineEmits(["logout"]);

function navigateTo(path: string) {
  window.location.href = path;
}
</script>

<template>
  <template v-if="user">
    <UPopover mode="click" :popper="{ placement: 'bottom-end' }">
      <UButton
        variant="ghost"
        size="sm"
        class="p-1.5 hover:bg-blue-50 transition-all duration-200 rounded-full"
      >
        <UAvatar
          :src="user.image || ''"
          :alt="user.name || user.username || 'Usuario'"
          size="sm"
          class="ring-2 ring-blue-100 hover:ring-blue-200 transition-all duration-200"
        >
          <template #fallback>
            <UIcon name="i-heroicons-user" class="w-4 h-4 text-slate-600" />
          </template>
        </UAvatar>
      </UButton>

      <template #content>
        <UCard class="w-64">
          <!-- User Info Header -->
          <template #header>
            <div class="flex items-center space-x-3">
              <UAvatar
                :src="user.image || ''"
                :alt="user.name || user.username || 'Usuario'"
                size="sm"
              >
                <template #fallback>
                  <UIcon
                    name="i-heroicons-user"
                    class="w-4 h-4 text-slate-600"
                  />
                </template>
              </UAvatar>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 truncate">
                  {{ user.name || user.username || "Usuario" }}
                </p>
                <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
                <p
                  v-if="user.role"
                  class="text-xs text-blue-600 font-medium capitalize"
                >
                  {{ user.role }}
                </p>
              </div>
            </div>
          </template>

          <!-- Menu Items -->
          <div class="space-y-1">
            <UButton
              variant="ghost"
              size="sm"
              class="w-full justify-start"
              @click="navigateTo('/user')"
            >
              <UIcon name="i-heroicons-user-circle" class="w-4 h-4 mr-2" />
              Perfil
            </UButton>

            <UButton
              v-if="user.role === 'admin'"
              variant="ghost"
              size="sm"
              class="w-full justify-start"
              @click="navigateTo('/user')"
            >
              <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-2" />
              Panel de Administración
            </UButton>

            <!-- Simple divider -->
            <hr class="my-2 border-gray-200" />

            <UButton
              variant="ghost"
              size="sm"
              class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              @click="emit('logout')"
            >
              <UIcon
                name="i-heroicons-arrow-right-on-rectangle"
                class="w-4 h-4 mr-2"
              />
              Cerrar sesión
            </UButton>
          </div>
        </UCard>
      </template>
    </UPopover>
  </template>
  <template v-else>
    <UButton
      to="/login"
      variant="outline"
      size="sm"
      class="text-blue-600 border-blue-300 hover:bg-blue-50 transition-all duration-200 rounded-lg"
    >
      <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
      Iniciar sesión
    </UButton>
  </template>
</template>
