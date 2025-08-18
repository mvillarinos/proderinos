<script setup lang="ts">
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
  role?: string;
  dbId?: number;
}

definePageMeta({
  auth: true,
  layout: "user",
});

const { data: session } = useAuth();

const user = computed(() => session.value?.user);
const userDb = computed(() => session.value?.user as ExtendedUser);
const isGoogleUser = computed(() => !!user.value?.image && !!user.value?.email);
const isCredentialsUser = computed(
  () => !isGoogleUser.value && !!userDb.value?.username
);
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        Panel de Administración
      </h1>

      <!-- User Info Card -->
      <div
        class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6"
      >
        <h2 class="text-lg font-semibold text-gray-800 mb-2">
          Información de la sesión
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Nombre:</span>
            <span class="ml-2 text-gray-800">{{
              user?.name || "No disponible"
            }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Email:</span>
            <span class="ml-2 text-gray-800">{{
              user?.email || "No disponible"
            }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Usuario:</span>
            <span class="ml-2 text-gray-800">{{
              userDb?.username || "No disponible"
            }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Rol:</span>
            <span class="ml-2 text-gray-800 capitalize">{{
              userDb?.role || "No disponible"
            }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600"
              >Método de autenticación:</span
            >
            <span class="ml-2 text-gray-800">
              {{
                isGoogleUser
                  ? "Google OAuth"
                  : isCredentialsUser
                  ? "Credenciales"
                  : "Desconocido"
              }}
            </span>
          </div>
          <div v-if="userDb?.dbId">
            <span class="font-medium text-gray-600">ID en base de datos:</span>
            <span class="ml-2 text-gray-800">{{ userDb.dbId }}</span>
          </div>
        </div>

        <!-- Auth Method Badge -->
        <div class="mt-4">
          <UBadge
            v-if="isGoogleUser"
            color="primary"
            variant="soft"
            class="mr-2"
          >
            <template #leading>
              <svg class="w-3 h-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </template>
            Usuario Google
          </UBadge>
          <UBadge v-else-if="isCredentialsUser" color="success" variant="soft">
            <template #leading>
              <UIcon name="i-heroicons-key" class="w-3 h-3" />
            </template>
            Usuario Local
          </UBadge>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UCard>
          <template #header>
            <div class="flex items-center">
              <UIcon
                name="i-heroicons-trophy"
                class="w-5 h-5 text-blue-600 mr-2"
              />
              <h3 class="font-semibold">Torneos</h3>
            </div>
          </template>
          <p class="text-sm text-gray-600 mb-4">
            Gestiona torneos y competiciones
          </p>
          <UButton to="/tournaments" variant="outline" size="sm" block>
            Ver Torneos
          </UButton>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center">
              <UIcon
                name="i-heroicons-users"
                class="w-5 h-5 text-green-600 mr-2"
              />
              <h3 class="font-semibold">Usuarios</h3>
            </div>
          </template>
          <p class="text-sm text-gray-600 mb-4">
            Administra usuarios del sistema
          </p>
          <UButton variant="outline" size="sm" block disabled>
            Próximamente
          </UButton>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center">
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-5 h-5 text-purple-600 mr-2"
              />
              <h3 class="font-semibold">Estadísticas</h3>
            </div>
          </template>
          <p class="text-sm text-gray-600 mb-4">Revisa métricas y reportes</p>
          <UButton variant="outline" size="sm" block disabled>
            Próximamente
          </UButton>
        </UCard>
      </div>
    </div>
  </div>
</template>
