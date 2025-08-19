<script setup lang="ts">
definePageMeta({
  auth: false,
});

// Get tournament ID from route
const route = useRoute();
const tournamentId = parseInt(route.params.id as string);

if (!tournamentId) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid tournament ID",
  });
}

// Fetch data using composables
const {
  tournament,
  pending: tournamentPending,
  error: tournamentError,
} = useGetTournament(tournamentId);
const {
  couples,
  pending: couplesPending,
  error: couplesError,
} = useGetTournamentCouples(tournamentId);
const {
  matches,
  pending: matchesPending,
  error: matchesError,
} = useGetTournamentMatches(tournamentId);

// Computed properties
const isLoading = computed(() => tournamentPending.value);
const hasError = computed(() => tournamentError.value);

const completedMatches = computed(() => {
  return (
    matches.value?.filter((match) => match.status === "completed").length || 0
  );
});

const pendingMatches = computed(() => {
  return (
    matches.value?.filter((match) => match.status === "pending").length || 0
  );
});

// Tabs configuration
const tabs = [
  {
    key: "couples",
    label: "Equipos",
    icon: "i-heroicons-users",
  },
  {
    key: "matches",
    label: "Partidos",
    icon: "i-heroicons-play",
  },
];

// Helper functions
// function getStatusColor(status: string) {
//   const colors: Record<string, string> = {
//     draft: "neutral",
//     in_progress: "primary",
//     completed: "success",
//     cancelled: "error",
//   };
//   return colors[status] || "neutral";
// }

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Borrador",
    in_progress: "En Progreso",
    completed: "Finalizado",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
}

function getMatchStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En Progreso",
    completed: "Finalizado",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
}

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-blue-500"
      />
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="py-8">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="solid"
        title="Error"
        description="No se pudo cargar el torneo"
      />
    </div>

    <!-- Tournament Content -->
    <div v-else-if="tournament" class="space-y-6">
      <!-- Header -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <UIcon
                name="i-heroicons-trophy"
                class="w-8 h-8 text-yellow-500"
              />
              <div>
                <h1 class="text-3xl font-bold">{{ tournament.name }}</h1>
                <UBadge
                  :color="getStatusColor(tournament.status)"
                  variant="soft"
                  size="lg"
                  class="mt-2"
                >
                  {{ getStatusLabel(tournament.status) }}
                </UBadge>
              </div>
            </div>
            <div class="flex gap-2">
              <UButton
                variant="outline"
                icon="i-heroicons-pencil-square"
                @click="navigateTo(`/tournaments/edit?id=${tournament.id}`)"
              >
                Editar
              </UButton>
            </div>
          </div>
        </template>

        <div v-if="tournament.description" class="mb-6">
          <p class="text-gray-600">{{ tournament.description }}</p>
        </div>

        <!-- Tournament Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-users" class="w-5 h-5 text-blue-600" />
              <span class="text-sm font-medium text-gray-700">Equipos</span>
            </div>
            <p class="text-2xl font-bold text-blue-700 mt-1">
              {{ couples?.length || 0 }}
            </p>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-play" class="w-5 h-5 text-green-600" />
              <span class="text-sm font-medium text-gray-700">Partidos</span>
            </div>
            <p class="text-2xl font-bold text-green-700 mt-1">
              {{ matches?.length || 0 }}
            </p>
          </div>

          <div class="bg-yellow-50 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-check-circle"
                class="w-5 h-5 text-yellow-600"
              />
              <span class="text-sm font-medium text-gray-700">Completados</span>
            </div>
            <p class="text-2xl font-bold text-yellow-700 mt-1">
              {{ completedMatches }}
            </p>
          </div>

          <div class="bg-purple-50 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-purple-600" />
              <span class="text-sm font-medium text-gray-700">Pendientes</span>
            </div>
            <p class="text-2xl font-bold text-purple-700 mt-1">
              {{ pendingMatches }}
            </p>
          </div>
        </div>

        <!-- Dates -->
        <div
          v-if="tournament.start_date || tournament.end_date"
          class="mt-6 flex flex-wrap gap-4"
        >
          <div v-if="tournament.start_date" class="flex items-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600"
              >Inicio: {{ formatDate(tournament.start_date) }}</span
            >
          </div>
          <div v-if="tournament.end_date" class="flex items-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600"
              >Fin: {{ formatDate(tournament.end_date) }}</span
            >
          </div>
        </div>
      </UCard>

      <!-- Tabs -->
      <UTabs :items="tabs" class="w-full">
        <!-- Couples Tab -->
        <template #couples="{ item }">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">
                  Equipos ({{ couples?.length || 0 }})
                </h3>
                <UButton icon="i-heroicons-plus" size="sm">
                  Agregar Equipo
                </UButton>
              </div>
            </template>

            <div v-if="couplesPending" class="flex justify-center py-8">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-6 h-6 animate-spin text-blue-500"
              />
            </div>

            <div v-else-if="couplesError" class="py-4">
              <UAlert
                icon="i-heroicons-exclamation-triangle"
                color="error"
                title="Error"
                description="No se pudieron cargar los equipos"
              />
            </div>

            <div v-else-if="couples && couples.length > 0" class="space-y-3">
              <div
                v-for="couple in couples"
                :key="couple.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-users"
                    class="w-5 h-5 text-blue-600"
                  />
                  <div>
                    <p class="font-medium">
                      {{ couple.player1_name }} & {{ couple.player2_name }}
                    </p>
                    <p class="text-sm text-gray-500">Equipo #{{ couple.id }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <UIcon
                name="i-heroicons-users"
                class="w-12 h-12 mx-auto mb-3 text-gray-400"
              />
              <p>No hay equipos registrados</p>
            </div>
          </UCard>
        </template>

        <!-- Matches Tab -->
        <template #matches="{ item }">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">
                  Partidos ({{ matches?.length || 0 }})
                </h3>
                <UButton icon="i-heroicons-plus" size="sm">
                  Agregar Partido
                </UButton>
              </div>
            </template>

            <div v-if="matchesPending" class="flex justify-center py-8">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-6 h-6 animate-spin text-blue-500"
              />
            </div>

            <div v-else-if="matchesError" class="py-4">
              <UAlert
                icon="i-heroicons-exclamation-triangle"
                color="error"
                title="Error"
                description="No se pudieron cargar los partidos"
              />
            </div>

            <div v-else-if="matches && matches.length > 0" class="space-y-3">
              <div
                v-for="match in matches"
                :key="match.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-500">
                        {{ match.round_name }} - Partido {{ match.match_order }}
                      </span>
                      <UBadge
                        :color="getStatusColor(match.status)"
                        variant="soft"
                      >
                        {{ getMatchStatusLabel(match.status) }}
                      </UBadge>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="text-center">
                        <p class="font-medium">
                          {{ match.couple1?.player1_name }} &
                          {{ match.couple1?.player2_name }}
                        </p>
                        <p class="text-2xl font-bold text-blue-600">
                          {{ match.score_couple1 || 0 }}
                        </p>
                      </div>

                      <div class="px-4">
                        <UIcon
                          name="i-heroicons-arrow-right"
                          class="w-5 h-5 text-gray-400"
                        />
                      </div>

                      <div class="text-center">
                        <p class="font-medium">
                          {{ match.couple2?.player1_name }} &
                          {{ match.couple2?.player2_name }}
                        </p>
                        <p class="text-2xl font-bold text-green-600">
                          {{ match.score_couple2 || 0 }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <UIcon
                name="i-heroicons-play"
                class="w-12 h-12 mx-auto mb-3 text-gray-400"
              />
              <p>No hay partidos programados</p>
            </div>
          </UCard>
        </template>
      </UTabs>
    </div>
  </div>
</template>
