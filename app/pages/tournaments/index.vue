<script setup lang="ts">
definePageMeta({
  auth: false,
});

interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: "draft" | "in_progress" | "completed" | "cancelled";
  start_date?: string;
  couples_count: number;
  matches_count: number;
}

interface StatusOption {
  label: string;
  value: string;
}

// State
const searchQuery = ref("");
const statusFilter = ref("");
const showDeleteModal = ref(false);
const tournamentToDelete = ref<Tournament | null>(null);

// Fetch tournaments
const { data: tournaments, pending } = await useLazyFetch<Tournament[]>(
  "/api/tournaments",
  {
    server: false,
    default: () => [],
  }
);

// Filter options
const statusOptions: StatusOption[] = [
  { label: "All Statuses", value: "" },
  { label: "Draft", value: "draft" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

// Computed
const filteredTournaments = computed(() => {
  if (!tournaments.value) return [];

  return tournaments.value.filter((tournament) => {
    const matchesSearch =
      !searchQuery.value ||
      tournament.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (tournament.description &&
        tournament.description
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()));

    const matchesStatus =
      !statusFilter.value || tournament.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

// Helper functions
function getStatusColor(
  status: string
):
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral" {
  const colors: Record<
    string,
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
  > = {
    draft: "neutral",
    in_progress: "info",
    completed: "success",
    cancelled: "error",
  };
  return colors[status] || "neutral";
}

function formatDate(dateString?: string): string {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString();
}

// Page meta
useHead({
  title: "Tournaments - Proderinos",
});
</script>

<template>
  <div class="space-y-8">
    <!-- Modern Page Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
    >
      <div>
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Torneos
        </h1>
        <p class="text-slate-600 mt-2 text-lg">
          Manage all your pelota paleta tournaments
        </p>
        <p class="text-slate-600 mt-2 text-lg">
          Administra todos tus torneos de pelota paleta
        </p>
      </div>
      <UButton
        to="/tournaments/create"
        size="lg"
        class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <UIcon name="i-heroicons-plus" class="w-5 h-5 mr-2" />
        Crear Torneo
      </UButton>
    </div>

    <!-- Modern Filters Section -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div
        class="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center"
      >
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="Buscar torneos por nombre o descripción..."
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon
                name="i-heroicons-magnifying-glass"
                class="w-5 h-5 text-slate-400"
              />
            </template>
          </UInput>
        </div>

        <div class="lg:w-64">
          <USelectMenu
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Filtrar por estado"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-slate-400" />
            </template>
          </USelectMenu>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <ClientOnly>
      <!-- Modern Loading State -->
      <div v-if="pending" class="flex justify-center py-20">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"
          />
          <div
            class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
          />
        </div>
      </div>

      <!-- Modern Tournaments Grid -->
      <div v-else-if="filteredTournaments?.length" class="space-y-6">
        <!-- Tournament Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="tournament in filteredTournaments"
            :key="tournament.id"
            class="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 cursor-pointer transform hover:scale-105"
            @click="navigateTo(`/tournaments/${tournament.id}`)"
          >
            <!-- Card Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1 pr-3">
                <h3
                  class="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {{ tournament.name }}
                </h3>
                <p
                  v-if="tournament.description"
                  class="text-slate-600 text-sm mt-1 line-clamp-2"
                >
                  {{ tournament.description }}
                </p>
              </div>
              <UBadge
                :color="getStatusColor(tournament.status)"
                variant="subtle"
                class="capitalize flex-shrink-0"
              >
                {{ tournament.status.replace("_", " ").toLowerCase() }}
              </UBadge>
            </div>

            <!-- Card Stats -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div
                class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3"
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-users"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span class="text-sm font-medium text-slate-700"
                    >Equipos</span
                  >
                </div>
                <p class="text-xl font-bold text-blue-700 mt-1">
                  {{ tournament.couples_count }}
                </p>
              </div>

              <div
                class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3"
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-play"
                    class="w-4 h-4 text-emerald-600"
                  />
                  <span class="text-sm font-medium text-slate-700"
                    >Partidos</span
                  >
                </div>
                <p class="text-xl font-bold text-emerald-700 mt-1">
                  {{ tournament.matches_count }}
                </p>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="flex items-center justify-between">
              <div class="text-sm text-slate-500">
                <UIcon
                  name="i-heroicons-calendar"
                  class="w-4 h-4 inline mr-1"
                />
                {{ formatDate(tournament.start_date) }}
              </div>

              <div class="flex items-center gap-1">
                <UButton
                  icon="i-heroicons-eye"
                  variant="ghost"
                  size="sm"
                  class="text-blue-600 hover:bg-blue-50"
                  @click.stop="navigateTo(`/tournaments/${tournament.id}`)"
                />
                <UButton
                  icon="i-heroicons-trash"
                  variant="ghost"
                  size="sm"
                  class="text-red-600 hover:bg-red-50"
                  @click.stop="
                    () => {
                      tournamentToDelete = tournament;
                      showDeleteModal = true;
                    }
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Table View Toggle -->
        <div class="mt-8">
          <!-- Detailed Table View -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-table-cells"
                  class="w-5 h-5 text-slate-600"
                />
                <h3 class="font-semibold text-slate-800">Vista Detallada</h3>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Torneo
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fecha de Inicio
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estadísticas
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="tournament in filteredTournaments"
                    :key="tournament.id"
                    class="hover:bg-gray-50"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="min-w-0">
                        <p class="font-medium text-slate-800 truncate">
                          {{ tournament.name }}
                        </p>
                        <p
                          v-if="tournament.description"
                          class="text-sm text-slate-500 truncate mt-1"
                        >
                          {{ tournament.description }}
                        </p>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <UBadge
                        :color="getStatusColor(tournament.status)"
                        variant="subtle"
                        class="capitalize"
                      >
                        {{ tournament.status.replace("_", " ") }}
                      </UBadge>
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      <span class="text-slate-700">{{
                        formatDate(tournament.start_date)
                      }}</span>
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      <div class="text-sm space-y-1">
                        <div class="flex items-center gap-1">
                          <UIcon
                            name="i-heroicons-users"
                            class="w-3 h-3 text-blue-600"
                          />
                          <span class="text-slate-700"
                            >{{ tournament.couples_count }} equipos</span
                          >
                        </div>
                        <div class="flex items-center gap-1">
                          <UIcon
                            name="i-heroicons-play"
                            class="w-3 h-3 text-emerald-600"
                          />
                          <span class="text-slate-700"
                            >{{ tournament.matches_count }} partidos</span
                          >
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex gap-1">
                        <UButton
                          icon="i-heroicons-eye"
                          variant="ghost"
                          size="sm"
                          class="text-blue-600 hover:bg-blue-50"
                          @click="navigateTo(`/tournaments/${tournament.id}`)"
                        />
                        <UButton
                          icon="i-heroicons-trash"
                          variant="ghost"
                          size="sm"
                          class="text-red-600 hover:bg-red-50"
                          @click="
                            () => {
                              tournamentToDelete = tournament;
                              showDeleteModal = true;
                            }
                          "
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Empty State -->
      <div v-else class="text-center py-20">
        <div
          class="w-24 h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8"
        >
          <UIcon name="i-heroicons-trophy" class="w-12 h-12 text-slate-400" />
        </div>

        <h3 class="text-2xl font-bold text-slate-800 mb-4">
          {{
            searchQuery || statusFilter
              ? "No se encontraron torneos"
              : "No hay torneos aún"
          }}
        </h3>

        <p class="text-slate-600 mb-8 max-w-md mx-auto text-lg">
          {{
            searchQuery || statusFilter
              ? "Intenta ajustar tus criterios de búsqueda o filtros para encontrar lo que buscas."
              : "Comienza creando tu primer torneo y empieza a gestionar tus competiciones de pelota paleta."
          }}
        </p>

        <div class="space-y-4">
          <UButton
            to="/tournaments/create"
            size="lg"
            class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <UIcon name="i-heroicons-plus" class="w-5 h-5 mr-2" />
            Crea Tu Primer Torneo
          </UButton>

          <div v-if="searchQuery || statusFilter">
            <UButton
              variant="outline"
              @click="
                () => {
                  searchQuery = '';
                  statusFilter = '';
                }
              "
            >
              Limpiar Filtros
            </UButton>
          </div>
        </div>
      </div>

      <template #fallback>
        <div class="flex justify-center py-20">
          <div class="relative">
            <div
              class="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"
            />
            <div
              class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
            />
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
