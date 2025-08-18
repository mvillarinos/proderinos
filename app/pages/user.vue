<script setup lang="ts">
definePageMeta({
  auth: {
    authenticatedOnly: true,
  },
});

const { data: session, status } = useAuth();

// User data with proper typing
const user = computed(() => {
  const sessionUser = session.value?.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
    role?: "admin" | "organizator" | "player";
    dbId?: string | number;
    profileCompleted?: boolean;
  };
  return sessionUser;
});

const isAdmin = computed(() => user.value?.role === "admin");
const isOrganizator = computed(() => user.value?.role === "organizator");
</script>

<template>
  <div>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">Proderinos</h1>
            </div>

            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <UIcon
                  name="i-heroicons-user-circle"
                  class="w-5 h-5 text-gray-500"
                />
                <span class="text-sm text-gray-700">{{
                  user?.username || user?.name || "Usuario"
                }}</span>
                <UBadge
                  :color="
                    isAdmin ? 'error' : isOrganizator ? 'primary' : 'success'
                  "
                  variant="subtle"
                  class="capitalize"
                >
                  {{ user?.role || "player" }}
                </UBadge>
              </div>

              <UButton
                variant="ghost"
                size="sm"
                to="/api/auth/signout"
                external
              >
                Salir
              </UButton>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Welcome Section -->
          <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div class="px-4 py-5 sm:p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-2">
                ¡Bienvenido{{ user?.name ? `, ${user.name}` : "" }}!
              </h2>
              <p class="text-gray-600">
                Gestiona tus torneos, apuestas y participa en competencias.
              </p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Tournaments -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <UIcon
                      name="i-heroicons-trophy"
                      class="h-8 w-8 text-yellow-500"
                    />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">Torneos</h3>
                    <p class="text-sm text-gray-600">
                      Ver y participar en torneos
                    </p>
                  </div>
                </div>
                <div class="mt-4">
                  <UButton to="/tournaments" block> Ver torneos </UButton>
                </div>
              </div>
            </div>

            <!-- Create Tournament (Admin/Organizator only) -->
            <div
              v-if="isAdmin || isOrganizator"
              class="bg-white overflow-hidden shadow rounded-lg"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <UIcon
                      name="i-heroicons-plus-circle"
                      class="h-8 w-8 text-green-500"
                    />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">
                      Crear Torneo
                    </h3>
                    <p class="text-sm text-gray-600">
                      Organiza un nuevo torneo
                    </p>
                  </div>
                </div>
                <div class="mt-4">
                  <UButton to="/tournaments/create" block color="success">
                    Crear torneo
                  </UButton>
                </div>
              </div>
            </div>

            <!-- Admin Panel (Admin only) -->
            <div
              v-if="isAdmin"
              class="bg-white overflow-hidden shadow rounded-lg"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <UIcon
                      name="i-heroicons-cog-6-tooth"
                      class="h-8 w-8 text-blue-500"
                    />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">
                      Administración
                    </h3>
                    <p class="text-sm text-gray-600">Panel de administración</p>
                  </div>
                </div>
                <div class="mt-4">
                  <UButton to="/admin" block color="primary">
                    Ir a admin
                  </UButton>
                </div>
              </div>
            </div>

            <!-- Profile Settings -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <UIcon
                      name="i-heroicons-user"
                      class="h-8 w-8 text-purple-500"
                    />
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">Mi Perfil</h3>
                    <p class="text-sm text-gray-600">
                      Editar información personal
                    </p>
                  </div>
                </div>
                <div class="mt-4">
                  <UButton variant="outline" block> Editar perfil </UButton>
                </div>
              </div>
            </div>
          </div>

          <!-- User Info (Debug) -->
          <div
            v-if="status === 'authenticated'"
            class="mt-6 bg-white overflow-hidden shadow rounded-lg"
          >
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Información de sesión
              </h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-700">Usuario:</span>
                  <span class="ml-2 text-gray-600">{{ user?.username }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Email:</span>
                  <span class="ml-2 text-gray-600">{{ user?.email }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Nombre:</span>
                  <span class="ml-2 text-gray-600">{{
                    user?.name || "No especificado"
                  }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Rol:</span>
                  <span class="ml-2 text-gray-600 capitalize">{{
                    user?.role
                  }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700">ID:</span>
                  <span class="ml-2 text-gray-600">{{ user?.id }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-700"
                    >Perfil completo:</span
                  >
                  <span class="ml-2 text-gray-600">{{
                    user?.profileCompleted ? "Sí" : "No"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
