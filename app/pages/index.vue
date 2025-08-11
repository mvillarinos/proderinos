<script setup lang="ts">
interface Tournament {
  id: number
  name: string
  description?: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  start_date?: string
  couples_count: number
  matches_count: number
}

// Fetch recent tournaments and current tournament
const { data: recentTournaments, pending } = await useLazyFetch<Tournament[]>('/api/tournaments', {
  server: false,
  default: () => []
})

// Get current tournament (in progress)
const currentTournament = computed(() => {
  return recentTournaments.value?.find(t => t.status === 'in_progress') || null
})

// Get completed tournaments for previous matches
const completedTournaments = computed(() => {
  return recentTournaments.value?.filter(t => t.status === 'completed') || []
})

// Helper functions
function getStatusColor(status: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    draft: 'neutral',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error'
  }
  return colors[status] || 'neutral'
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// Page meta
useHead({
  title: 'Home - VillaBet Tournaments'
})
</script>

<template>
  <div class="space-y-16">
    <!-- Modern Hero Section -->
    <section class="text-center py-16 px-4">
      <div class="max-w-4xl mx-auto">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-8">
          <UIcon name="i-heroicons-trophy" class="w-10 h-10 text-white" />
        </div>
        
        <h1 class="text-5xl sm:text-6xl font-bold mb-6">
          <span class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            VillaBet
          </span>
          <br>
          <span class="text-slate-800">Padel Tournament Betting</span>
        </h1>
        
        <p class="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Experience the thrill of padel tournament betting. View live tournaments, 
          check match results, and follow the exciting competition action.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <UButton 
            v-if="currentTournament"
            :to="`/tournaments/${currentTournament.id}`"
            size="xl"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4"
          >
            <UIcon name="i-heroicons-play" class="w-5 h-5 mr-2" />
            View Current Tournament
          </UButton>
          
          <UButton 
            v-else
            disabled
            size="xl"
            class="bg-gray-400 text-white cursor-not-allowed px-8 py-4"
          >
            <UIcon name="i-heroicons-stop" class="w-5 h-5 mr-2" />
            No Current Tournament
          </UButton>
          
          <UButton 
            to="/admin/login"
            variant="outline"
            size="xl"
            class="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 px-8 py-4"
          >
            <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 mr-2" />
            Admin Access
          </UButton>
        </div>
      </div>
    </section>

    <!-- Modern Action Cards -->
    <section class="px-4">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Current Tournament Card -->
          <div class="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div class="absolute top-4 right-4 w-12 h-12 bg-emerald-100 rounded-xl opacity-20" />
            <div class="relative z-10">
              <div class="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <UIcon name="i-heroicons-play" class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3">Current Tournament</h3>
              <p class="text-slate-600 mb-6 leading-relaxed">
                {{ currentTournament ? `Follow live matches in ${currentTournament.name}` : 'No active tournament at the moment. Check back soon!' }}
              </p>
              <UButton 
                v-if="currentTournament"
                :to="`/tournaments/${currentTournament.id}`" 
                size="sm"
                class="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
              >
                <UIcon name="i-heroicons-eye" class="w-4 h-4 mr-2" />
                View Live Tournament
              </UButton>
              <UButton 
                v-else
                disabled
                size="sm"
                class="bg-gray-400 text-white w-full cursor-not-allowed"
              >
                <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-2" />
                No Active Tournament
              </UButton>
            </div>
          </div>

          <!-- Previous Matches Card -->
          <div class="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div class="absolute top-4 right-4 w-12 h-12 bg-blue-100 rounded-xl opacity-20" />
            <div class="relative z-10">
              <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <UIcon name="i-heroicons-clock" class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3">Previous Matches</h3>
              <p class="text-slate-600 mb-6 leading-relaxed">
                {{ completedTournaments.length ? `Browse results from ${completedTournaments.length} completed tournaments` : 'No completed tournaments yet.' }}
              </p>
              <UButton 
                to="/tournaments" 
                variant="outline"
                size="sm"
                class="border-blue-300 text-blue-700 hover:bg-blue-50 w-full"
              >
                <UIcon name="i-heroicons-archive-box" class="w-4 h-4 mr-2" />
                View Match History
              </UButton>
            </div>
          </div>

          <!-- Admin Panel Card -->
          <div class="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div class="absolute top-4 right-4 w-12 h-12 bg-purple-100 rounded-xl opacity-20" />
            <div class="relative z-10">
              <div class="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <UIcon name="i-heroicons-cog-6-tooth" class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3">Admin Panel</h3>
              <p class="text-slate-600 mb-6 leading-relaxed">
                Manage tournaments, profiles, and betting predictions. Admin access required for tournament management.
              </p>
              <UButton 
                to="/admin/login" 
                variant="outline"
                size="sm"
                class="border-purple-300 text-purple-700 hover:bg-purple-50 w-full"
              >
                <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 mr-2" />
                Admin Login
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modern Recent Tournaments Section -->
    <section class="px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">All Tournaments</h2>
          <p class="text-lg text-slate-600">Browse current and previous tournament activity</p>
        </div>
        
        <ClientOnly>
          <div v-if="pending" class="flex justify-center py-16">
            <div class="relative">
              <div class="w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse" />
              <div class="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          
          <div v-else-if="recentTournaments?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="tournament in recentTournaments" 
              :key="tournament.id"
              class="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 cursor-pointer transform hover:scale-105"
              @click="navigateTo(`/tournaments/${tournament.id}`)"
            >
              <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-lg truncate pr-2">
                  {{ tournament.name }}
                </h3>
                <UBadge 
                  :color="getStatusColor(tournament.status)"
                  variant="subtle"
                  class="capitalize flex-shrink-0"
                >
                  {{ tournament.status.replace('_', ' ') }}
                </UBadge>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500">Teams:</span>
                  <span class="font-medium text-slate-700">{{ tournament.couples_count }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500">Matches:</span>
                  <span class="font-medium text-slate-700">{{ tournament.matches_count }}</span>
                </div>
                <div v-if="tournament.start_date" class="flex items-center justify-between text-sm">
                  <span class="text-slate-500">Start Date:</span>
                  <span class="font-medium text-slate-700">{{ formatDate(tournament.start_date) }}</span>
                </div>
              </div>
              
              <div class="mt-6 flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                <span class="text-sm font-medium">View Details</span>
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-16">
            <div class="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UIcon name="i-heroicons-trophy" class="w-10 h-10 text-slate-400" />
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-3">No tournaments yet</h3>
            <p class="text-slate-600 mb-8 max-w-md mx-auto">
              Get started by creating your first tournament and begin managing your pelota paleta competitions!
            </p>
            <UButton 
              to="/tournaments/create"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
              Create Your First Tournament
            </UButton>
          </div>
          
          <template #fallback>
            <div class="flex justify-center py-16">
              <div class="relative">
                <div class="w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse" />
                <div class="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>
