<script setup lang="ts">
// Types
interface Tournament {
  id: number
  name: string
  description?: string
  start_date?: string
  end_date?: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  couples_count?: number
  matches_count?: number
}

interface Couple {
  id: number
  player1_name: string
  player2_name: string
  tournament_id: number
  created_at?: string
}

interface Match {
  id: number
  couple1_id: number
  couple2_id: number
  score_couple1?: number
  score_couple2?: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  match_order: number
  couple1: Couple
  couple2: Couple
}

interface MatchStats {
  total_matches: number
  completed_matches: number
  standings: Array<{
    couple: string
    wins: number
    losses: number
    points_for: number
    points_against: number
  }>
}

interface FormOption {
  label: string
  value: string
}

// Get tournament ID from route
const route = useRoute()
const tournamentId = route.params.id as string

// State
const activeTab = ref(0)
const showAddCoupleModal = ref(false)
const showGenerateMatchesModal = ref(false)
const showAddMatchModal = ref(false)
const showEditMatchModal = ref(false)
const selectedMatch = ref<Match | null>(null)

// Form states
const addingCouple = ref(false)
const generatingMatches = ref(false)
const updatingMatch = ref(false)

// Fetch tournament data
const { data: tournament, pending } = await useLazyFetch<Tournament | null>(`/api/tournaments/${tournamentId}`, {
  server: false,
  default: () => undefined
})

// Fetch couples
const { data: couples, pending: couplesLoading, refresh: refreshCouples } = await useLazyFetch<Couple[]>(`/api/tournaments/${tournamentId}/couples`, {
  server: false,
  default: () => []
})

// Fetch matches
const { data: matches, pending: matchesLoading, refresh: refreshMatches } = await useLazyFetch<Match[]>(`/api/tournaments/${tournamentId}/matches`, {
  server: false,
  default: () => []
})

// Fetch stats
const { data: stats, pending: statsLoading, refresh: refreshStats } = await useLazyFetch<MatchStats | null>(`/api/tournaments/${tournamentId}/stats`, {
  server: false,
  default: () => undefined
})

// Form data
const coupleForm = reactive({
  player1_name: '',
  player2_name: ''
})

const generateForm = reactive({
  format: 'round_robin'
})

const matchResultForm = reactive({
  score_couple1: 0,
  score_couple2: 0,
  status: 'completed' as 'pending' | 'in_progress' | 'completed' | 'cancelled'
})

// Options
const formatOptions: FormOption[] = [
  { label: 'Round Robin (everyone plays everyone)', value: 'round_robin' },
  { label: 'Knockout Tournament', value: 'knockout' }
]

const matchStatusOptions: FormOption[] = [
  { label: 'Completed', value: 'completed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Pending', value: 'pending' },
  { label: 'Cancelled', value: 'cancelled' }
]

// Tabs configuration  
const tabs: Array<{ key: string; label: string; icon: string }> = [
  { key: 'couples', label: 'Couples', icon: 'i-heroicons-users' },
  { key: 'matches', label: 'Matches', icon: 'i-heroicons-rectangle-group' },
  { key: 'stats', label: 'Statistics', icon: 'i-heroicons-chart-bar' }
]

// Table columns
const matchColumns: Array<{ key: string; label: string }> = [
  { key: 'match_order', label: 'Order' },
  { key: 'couple1', label: 'Couple 1' },
  { key: 'couple2', label: 'Couple 2' },
  { key: 'score', label: 'Score' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

const standingsColumns: Array<{ key: string; label: string }> = [
  { key: 'couple', label: 'Couple' },
  { key: 'record', label: 'W-L' },
  { key: 'points', label: 'Points For-Against' }
]

// Computed
const completedMatches = computed(() => {
  return matches.value?.filter(match => match.status === 'completed').length || 0
})

// Helper functions
function getStatusColor(status: string): "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral" | undefined {
  const colors: Record<string, "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"> = {
    draft: 'neutral',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error'
  }
  return colors[status] || 'neutral'
}

function getMatchStatusColor(status: string): "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral" | undefined {
  const colors: Record<string, "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"> = {
    pending: 'neutral',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'error'
  }
  return colors[status] || 'neutral'
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// Actions
async function addCouple() {
  addingCouple.value = true
  try {
    await $fetch(`/api/tournaments/${tournamentId}/couples`, {
      method: 'POST',
      body: coupleForm
    })
    
    showAddCoupleModal.value = false
    coupleForm.player1_name = ''
    coupleForm.player2_name = ''
    await refreshCouples()
  } catch (error) {
    console.error('Failed to add couple:', error)
  } finally {
    addingCouple.value = false
  }
}

async function generateMatches() {
  generatingMatches.value = true
  try {
    await $fetch(`/api/tournaments/${tournamentId}/matches/generate`, {
      method: 'POST',
      body: generateForm
    })
    
    showGenerateMatchesModal.value = false
    await refreshMatches()
  } catch (error) {
    console.error('Failed to generate matches:', error)
  } finally {
    generatingMatches.value = false
  }
}

function editMatchResult(match: Match) {
  selectedMatch.value = match
  matchResultForm.score_couple1 = match.score_couple1 || 0
  matchResultForm.score_couple2 = match.score_couple2 || 0
  matchResultForm.status = match.status
  showEditMatchModal.value = true
}

async function updateMatchResult() {
  if (!selectedMatch.value) return
  
  updatingMatch.value = true
  try {
    await $fetch(`/api/tournaments/${tournamentId}/matches/${selectedMatch.value.id}/result`, {
      method: 'PATCH',
      body: matchResultForm
    })
    
    showEditMatchModal.value = false
    await refreshMatches()
    await refreshStats()
  } catch (error) {
    console.error('Failed to update match result:', error)
  } finally {
    updatingMatch.value = false
  }
}

// Page meta
useHead({
  title: computed(() => tournament.value ? `${tournament.value.name} - Villabet` : 'Tournament - Villabet')
})
</script>

<template>
  <div class="space-y-8">
    <!-- Modern Loading State -->
    <div v-if="pending" class="flex justify-center py-20">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse" />
        <div class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>

    <!-- Tournament Details -->
    <div v-else-if="tournament" class="space-y-8">
      <!-- Modern Page Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-4">
              <UBadge 
                :color="getStatusColor(tournament.status)"
                variant="solid"
                class="capitalize"
              >
                {{ tournament.status.replace('_', ' ') }}
              </UBadge>
            </div>
            <h1 class="text-4xl lg:text-5xl font-bold mb-3">{{ tournament.name }}</h1>
            <p class="text-xl text-blue-100 leading-relaxed">
              {{ tournament.description || 'Tournament details and management' }}
            </p>
            <div v-if="tournament.start_date || tournament.end_date" class="flex flex-wrap gap-4 mt-4 text-blue-100">
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
              Back
            </UButton>
            <UButton 
              :to="`/tournaments/${tournament.id}/edit`"
              variant="solid"
              size="lg"
              class="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
            >
              <UIcon name="i-heroicons-pencil" class="w-5 h-5 mr-2" />
              Edit
            </UButton>
          </div>
        </div>
      </div>

      <!-- Modern Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <UIcon name="i-heroicons-users" class="w-6 h-6 text-white" />
            </div>
            <UIcon name="i-heroicons-chevron-up" class="w-4 h-4 text-green-500" />
          </div>
          <p class="text-3xl font-bold text-slate-800 mb-1">{{ tournament.couples_count || 0 }}</p>
          <p class="text-sm font-medium text-blue-600">Teams Registered</p>
        </div>
        
        <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <UIcon name="i-heroicons-rectangle-group" class="w-6 h-6 text-white" />
            </div>
            <UIcon name="i-heroicons-chevron-up" class="w-4 h-4 text-green-500" />
          </div>
          <p class="text-3xl font-bold text-slate-800 mb-1">{{ tournament.matches_count || 0 }}</p>
          <p class="text-sm font-medium text-emerald-600">Total Matches</p>
        </div>
        
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-white" />
            </div>
            <UIcon name="i-heroicons-chevron-up" class="w-4 h-4 text-green-500" />
          </div>
          <p class="text-3xl font-bold text-slate-800 mb-1">{{ completedMatches }}</p>
          <p class="text-sm font-medium text-purple-600">Completed Matches</p>
        </div>
        
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <UIcon name="i-heroicons-flag" class="w-6 h-6 text-white" />
            </div>
          </div>
          <div class="text-center">
            <UBadge 
              :color="getStatusColor(tournament.status)"
              variant="subtle"
              class="mb-2 capitalize"
            >
              {{ tournament.status.replace('_', ' ') }}
            </UBadge>
            <p class="text-sm font-medium text-amber-600">Tournament Status</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <UTabs 
        v-model="activeTab" 
        :items="tabs as any" 
        class="mt-8"
      >
        <!-- Couples Tab -->
        <!-- @ts-ignore -->
        <template #couples>
          <div class="py-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Tournament Couples</h3>
              <div class="flex gap-2">
                <UButton 
                  icon="i-heroicons-plus"
                  size="sm"
                  @click="showAddCoupleModal = true"
                >
                  Add Couple
                </UButton>
                <UButton 
                  v-if="couples?.length >= 2"
                  icon="i-heroicons-cog-6-tooth"
                  variant="outline"
                  size="sm"
                  @click="showGenerateMatchesModal = true"
                >
                  Generate Matches
                </UButton>
              </div>
            </div>

            <div v-if="couplesLoading" class="flex justify-center py-8">
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
            </div>

            <div v-else-if="couples?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <UCard v-for="couple in couples" :key="couple.id">
                <div class="text-center">
                  <UIcon name="i-heroicons-users" class="w-8 h-8 mx-auto mb-3 text-blue-500" />
                  <h4 class="font-semibold">{{ couple.player1_name }}</h4>
                  <h4 class="font-semibold">{{ couple.player2_name }}</h4>
                  <p class="text-sm text-gray-500 mt-2">
                    Added {{ formatDate(couple.created_at) }}
                  </p>
                </div>
              </UCard>
            </div>

            <UCard v-else class="text-center py-8">
              <UIcon name="i-heroicons-users" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 class="font-semibold mb-2">No couples added yet</h4>
              <p class="text-gray-600 mb-4">Add couples to start the tournament</p>
              <UButton 
                icon="i-heroicons-plus"
                @click="showAddCoupleModal = true"
              >
                Add First Couple
              </UButton>
            </UCard>
          </div>
        </template>

        <!-- Matches Tab -->
        <template #matches>
          <div class="py-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Tournament Matches</h3>
              <UButton 
                icon="i-heroicons-plus"
                size="sm"
                :disabled="(couples?.length || 0) < 2"
                @click="showAddMatchModal = true"
              >
                Add Match
              </UButton>
            </div>

            <div v-if="matchesLoading" class="flex justify-center py-8">
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
            </div>

            <div v-else-if="matches?.length">
              <UCard>
                <UTable 
                  :rows="matches"
                  :columns="matchColumns as any"
                >
                  <template #couple1-data="{ row }">
                    <div class="font-medium">
                      {{ (row as any).couple1.player1_name }} & {{ (row as any).couple1.player2_name }}
                    </div>
                  </template>

                  <template #couple2-data="{ row }">
                    <div class="font-medium">
                      {{ (row as any).couple2.player1_name }} & {{ (row as any).couple2.player2_name }}
                    </div>
                  </template>

                  <template #score-data="{ row }">
                    <div class="text-center">
                      <span class="font-bold">{{ (row as any).score_couple1 }} - {{ (row as any).score_couple2 }}</span>
                    </div>
                  </template>

                  <template #status-data="{ row }">
                    <UBadge 
                      :color="getMatchStatusColor((row as any).status)"
                      variant="subtle"
                    >
                      {{ (row as any).status }}
                    </UBadge>
                  </template>

                  <template #actions-data="{ row }">
                    <UButton 
                      v-if="(row as any).status !== 'completed'"
                      icon="i-heroicons-pencil-square"
                      size="sm"
                      variant="ghost"
                      @click="editMatchResult(row as any)"
                    >
                      Edit Result
                    </UButton>
                    <span v-else class="text-green-600 text-sm font-medium">
                      ✓ Completed
                    </span>
                  </template>
                </UTable>
              </UCard>
            </div>

            <UCard v-else class="text-center py-8">
              <UIcon name="i-heroicons-rectangle-group" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 class="font-semibold mb-2">No matches scheduled</h4>
              <p class="text-gray-600 mb-4">
                {{ (couples?.length || 0) < 2 ? 'Add at least 2 couples first' : 'Create matches to start the tournament' }}
              </p>
              <UButton 
                v-if="(couples?.length || 0) >= 2"
                icon="i-heroicons-cog-6-tooth"
                @click="showGenerateMatchesModal = true"
              >
                Generate Matches
              </UButton>
            </UCard>
          </div>
        </template>

        <!-- Statistics Tab -->
        <template #stats>
          <div class="py-6">
            <h3 class="text-lg font-semibold mb-6">Tournament Statistics</h3>
            
            <div v-if="statsLoading" class="flex justify-center py-8">
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
            </div>

            <div v-else-if="stats?.standings?.length">
              <UCard>
                <template #header>
                  <h4 class="font-semibold">Standings</h4>
                </template>
                
                <UTable 
                  :rows="stats.standings"
                  :columns="standingsColumns as any"
                >
                  <template #couple-data="{ row }">
                    <div class="font-medium">
                      {{ (row as any).player1_name }} & {{ (row as any).player2_name }}
                    </div>
                  </template>

                  <template #record-data="{ row }">
                    <span class="font-mono">{{ (row as any).wins }}-{{ (row as any).losses }}</span>
                  </template>

                  <template #points-data="{ row }">
                    <span class="font-mono">{{ (row as any).points_for }}-{{ (row as any).points_against }}</span>
                  </template>
                </UTable>
              </UCard>
            </div>

            <UCard v-else class="text-center py-8">
              <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 class="font-semibold mb-2">No statistics available</h4>
              <p class="text-gray-600">Complete some matches to see statistics</p>
            </UCard>
          </div>
        </template>
      </UTabs>
    </div>

    <!-- Error State -->
    <UCard v-else class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 mx-auto mb-4 text-red-400" />
      <h3 class="text-lg font-semibold mb-2">Tournament not found</h3>
      <p class="text-gray-600 mb-6">The tournament you're looking for doesn't exist.</p>
      <UButton to="/tournaments" icon="i-heroicons-arrow-left">
        Back to Tournaments
      </UButton>
    </UCard>

    <!-- Modals -->
    <!-- Add Couple Modal -->
    <UModal v-model="showAddCoupleModal">
      <UCard 
        role="dialog" 
        aria-labelledby="add-couple-modal-title" 
        aria-describedby="add-couple-modal-description"
      >
        <template #header>
          <h3 id="add-couple-modal-title" class="text-lg font-semibold">Add Couple</h3>
        </template>
        
        <div id="add-couple-modal-description">
          <UForm 
            :state="coupleForm"
            class="space-y-4"
            @submit="addCouple"
          >
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Player 1 Name *</label>
            <UInput 
              v-model="coupleForm.player1_name"
              placeholder="First player name"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Player 2 Name *</label>
            <UInput 
              v-model="coupleForm.player2_name"
              placeholder="Second player name"
              required
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <UButton 
              type="button"
              variant="ghost"
              @click="showAddCoupleModal = false"
            >
              Cancel
            </UButton>
            <UButton 
              type="submit"
              :loading="addingCouple"
            >
              Add Couple
            </UButton>
          </div>
        </UForm>
        </div>
      </UCard>
    </UModal>

    <!-- Generate Matches Modal -->
    <UModal v-model="showGenerateMatchesModal">
      <UCard 
        role="dialog" 
        aria-labelledby="generate-matches-modal-title" 
        aria-describedby="generate-matches-modal-description"
      >
        <template #header>
          <h3 id="generate-matches-modal-title" class="text-lg font-semibold">Generate Matches</h3>
        </template>
        
        <div id="generate-matches-modal-description" class="space-y-4">
          <p class="text-gray-600">
            Choose the tournament format to automatically generate matches.
          </p>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Tournament Format</label>
            <USelectMenu
              v-model="generateForm.format"
              :options="formatOptions"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <UButton 
              type="button"
              variant="ghost"
              @click="showGenerateMatchesModal = false"
            >
              Cancel
            </UButton>
            <UButton 
              :loading="generatingMatches"
              @click="generateMatches"
            >
              Generate Matches
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Edit Match Result Modal -->
    <UModal v-model="showEditMatchModal">
      <UCard 
        role="dialog" 
        aria-labelledby="edit-match-modal-title" 
        aria-describedby="edit-match-modal-description"
      >
        <template #header>
          <h3 id="edit-match-modal-title" class="text-lg font-semibold">Edit Match Result</h3>
        </template>
        
        <div v-if="selectedMatch" id="edit-match-modal-description" class="space-y-4">
          <div class="text-center py-4 bg-gray-50 rounded-lg">
            <p class="font-semibold">
              {{ selectedMatch.couple1.player1_name }} & {{ selectedMatch.couple1.player2_name }}
            </p>
            <p class="text-gray-600 text-sm">VS</p>
            <p class="font-semibold">
              {{ selectedMatch.couple2.player1_name }} & {{ selectedMatch.couple2.player2_name }}
            </p>
          </div>

          <UForm 
            :state="matchResultForm"
            class="space-y-4"
            @submit="updateMatchResult"
          >
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  {{ selectedMatch.couple1.player1_name }} & {{ selectedMatch.couple1.player2_name }}
                </label>
                <UInput 
                  v-model.number="matchResultForm.score_couple1"
                  type="number"
                  min="0"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  {{ selectedMatch.couple2.player1_name }} & {{ selectedMatch.couple2.player2_name }}
                </label>
                <UInput 
                  v-model.number="matchResultForm.score_couple2"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Match Status</label>
              <USelectMenu
                v-model="matchResultForm.status"
                :options="matchStatusOptions"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <UButton 
                type="button"
                variant="ghost"
                @click="showEditMatchModal = false"
              >
                Cancel
              </UButton>
              <UButton 
                type="submit"
                :loading="updatingMatch"
              >
                Update Result
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
