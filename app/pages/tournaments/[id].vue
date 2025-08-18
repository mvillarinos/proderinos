<script setup lang="ts">
definePageMeta({
  auth: false,
});

// Types
interface Tournament {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: "draft" | "in_progress" | "completed" | "cancelled";
  couples_count?: number;
  matches_count?: number;
}

interface Couple {
  id: number;
  player1_name: string;
  player2_name: string;
  tournament_id: number;
  created_at?: string;
}

interface Match {
  id: number;
  couple1_id: number;
  couple2_id: number;
  score_couple1?: number;
  score_couple2?: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  match_order: number;
  couple1: Couple;
  couple2: Couple;
}

// Get tournament ID from route
const route = useRoute();
const tournamentId = route.params.id as string;

// Fetch tournament data
const { data: tournament, pending } = await useLazyFetch<Tournament | null>(
  `/api/tournaments/${tournamentId}`,
  {
    server: false,
    default: () => undefined,
  }
);

// Fetch matches
const { data: matches } = await useLazyFetch<Match[]>(
  `/api/tournaments/${tournamentId}/matches`,
  {
    server: false,
    default: () => [],
  }
);

// Computed
const completedMatches = computed(() => {
  return (
    matches.value?.filter((match) => match.status === "completed").length || 0
  );
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
  | "neutral"
  | undefined {
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
    in_progress: "primary",
    completed: "success",
    cancelled: "error",
  };
  return colors[status] || "neutral";
}

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
}

// Page meta
useHead({
  title: computed(() =>
    tournament.value
      ? `${tournament.value.name} - Proderinos`
      : "Tournament - Proderinos"
  ),
});
</script>

<template>
  <div class="space-y-8">
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

    <!-- Tournament Details -->
    <div v-else-if="tournament" class="space-y-8">
      <!-- Modern Page Header -->
      <div
        class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div
          class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-4">
              <UBadge
                :color="getStatusColor(tournament.status)"
                variant="solid"
                class="capitalize"
              >
                {{ tournament.status.replace("_", " ") }}
              </UBadge>
            </div>
            <h1 class="text-4xl lg:text-5xl font-bold mb-3">
              {{ tournament.name }}
            </h1>
            <p class="text-xl text-blue-100 leading-relaxed">
              {{
                tournament.description || "Tournament details and management"
              }}
            </p>
            <div
              v-if="tournament.start_date || tournament.end_date"
              class="flex flex-wrap gap-4 mt-4 text-blue-100"
            >
              <div v-if="tournament.start_date" class="flex items-center gap-2">
                <UIcon name="i-heroicons-play" class="w-4 h-4" />
                <span>Start: {{ formatDate(tournament.start_date) }}</span>
              </div>
              <div v-if="tournament.end_date" class="flex items-center gap-2">
                <UIcon name="i-heroicons-stop" class="w-4 h-4" />
                <span>End: {{ formatDate(tournament.end_date) }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <UButton
              to="/tournaments"
              variant="outline"
              size="lg"
              class="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
              Volver
            </UButton>
            <UButton
              :to="`/tournaments/${tournament.id}/edit`"
              variant="solid"
              size="lg"
              class="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
            >
              <UIcon name="i-heroicons-pencil" class="w-5 h-5 mr-2" />
              Editar
            </UButton>
          </div>
        </div>
      </div>

      <!-- Modern Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"
            >
              <UIcon name="i-heroicons-users" class="w-6 h-6 text-white" />
            </div>
            <UIcon
              name="i-heroicons-chevron-up"
              class="w-4 h-4 text-green-500"
            />
          </div>
          <p class="text-3xl font-bold text-slate-800 mb-1">
            {{ tournament.couples_count || 0 }}
          </p>
          <p class="text-sm font-medium text-blue-600">Equipos Registrados</p>
        </div>

        <div
          class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center"
            >
              <UIcon
                name="i-heroicons-rectangle-group"
                class="w-6 h-6 text-white"
              />
            </div>
            <UIcon
              name="i-heroicons-chevron-up"
              class="w-4 h-4 text-green-500"
            />
          </div>
          <p class="text-3xl font-bold text-slate-800 mb-1">
            {{ tournament.matches_count || 0 }}
          </p>
          <p class="text-sm font-medium text-emerald-600">Total de Partidos</p>
        </div>

        <div
          class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
            >
              <UIcon
                name="i-heroicons-check-circle"
                class="w-6 h-6 text-white"
              />
            </div>
            <UIcon
              name="i-heroicons-chevron-up"
              class="w-4 h-4 text-green-500"
            />
          </div>
          <p class="text-3xl font-bold text-slate-800 mb-1">
            {{ completedMatches }}
          </p>
          <p class="text-sm font-medium text-purple-600">
            Partidos Completados
          </p>
        </div>

        <div
          class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100"
        >
          <div class="flex items-center justify-between mb-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center"
            >
              <UIcon name="i-heroicons-flag" class="w-6 h-6 text-white" />
            </div>
          </div>
          <div class="text-center">
            <UBadge
              :color="getStatusColor(tournament.status)"
              variant="subtle"
              class="mb-2 capitalize"
            >
              {{ tournament.status.replace("_", " ") }}
            </UBadge>
            <p class="text-sm font-medium text-amber-600">Estado del Torneo</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <UCard v-else class="text-center py-12">
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-16 h-16 mx-auto mb-4 text-red-400"
      />
      <h3 class="text-lg font-semibold mb-2">Torneo no encontrado</h3>
      <p class="text-gray-600 mb-6">El torneo que buscas no existe.</p>
      <UButton to="/tournaments" icon="i-heroicons-arrow-left">
        Volver a Torneos
      </UButton>
    </UCard>
  </div>
</template>
