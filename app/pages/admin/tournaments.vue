<script setup lang="ts">
definePageMeta({
  auth: true
})

// const { data: _session } = useAuth()

// Check if user is admin
// TODO: Re-enable role check after auth is fully working

interface Tournament {
  id: number
  name: string
  description?: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  start_date?: string
  end_date?: string
  couples_count?: number
  matches_count?: number
  created_at: string
}

const tournaments = ref<Tournament[]>([])
const isLoading = ref(true)
const isCreating = ref(false)

// Form for creating new tournament
const form = reactive({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'draft' as const
})

const formErrors = ref<Record<string, string>>({})

const loadTournaments = async () => {
  isLoading.value = true
  try {
    const data = await $fetch<Tournament[]>('/api/tournaments')
    tournaments.value = data || []
  } catch (error) {
    console.error('Failed to load tournaments:', error)
  } finally {
    isLoading.value = false
  }
}

const createTournament = async () => {
  formErrors.value = {}
  
  if (!form.name.trim()) {
    formErrors.value.name = 'Tournament name is required'
    return
  }
  
  isCreating.value = true
  try {
    await $fetch('/api/tournaments', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status
      }
    })
    
    // Reset form
    Object.assign(form, {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'draft' as const
    })
    
    // Reload tournaments
    await loadTournaments()
  } catch (error) {
    console.error('Failed to create tournament:', error)
    formErrors.value.general = 'Failed to create tournament. Please try again.'
  } finally {
    isCreating.value = false
  }
}

const updateTournamentStatus = async (tournamentId: number, newStatus: string) => {
  try {
    await $fetch(`/api/tournaments/${tournamentId}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    await loadTournaments()
  } catch (error) {
    console.error('Failed to update tournament status:', error)
  }
}

const getStatusColor = (status: string): "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral" => {
  const colors: Record<string, "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"> = {
    draft: 'neutral',
    in_progress: 'primary', 
    completed: 'success',
    cancelled: 'error'
  }
  return colors[status] || 'neutral'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const handleStatusChange = (tournamentId: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  if (target.value) {
    updateTournamentStatus(tournamentId, target.value)
    target.value = '' // Reset to default option
  }
}

onMounted(() => {
  loadTournaments()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-blue-600 hover:text-blue-700">
              <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Tournament Management</h1>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Create Tournament Form -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900">Create New Tournament</h2>
        </template>
        
        <form class="space-y-6" @submit.prevent="createTournament">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tournament Name *</label>
              <UInput
                v-model="form.name"
                placeholder="Enter tournament name"
                :disabled="isCreating"
              />
              <p v-if="formErrors.name" class="text-red-500 text-sm mt-1">{{ formErrors.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <USelect
                v-model="form.status"
                :options="[
                  { label: 'Draft', value: 'draft' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Cancelled', value: 'cancelled' }
                ]"
                :disabled="isCreating"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <UInput
                v-model="form.start_date"
                type="date"
                :disabled="isCreating"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <UInput
                v-model="form.end_date"
                type="date"
                :disabled="isCreating"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <UTextarea
              v-model="form.description"
              placeholder="Tournament description (optional)"
              :disabled="isCreating"
            />
          </div>

          <UAlert
            v-if="formErrors.general"
            color="error"
            variant="soft"
            :description="formErrors.general"
          />

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="isCreating"
              :disabled="isCreating"
              size="lg"
            >
              {{ isCreating ? 'Creating...' : 'Create Tournament' }}
            </UButton>
          </div>
        </form>
      </UCard>

      <!-- Tournaments List -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900">All Tournaments</h2>
        </template>

        <div v-if="isLoading" class="flex justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
        </div>

        <div v-else-if="tournaments.length === 0" class="text-center py-8">
          <UIcon name="i-heroicons-trophy" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No tournaments yet</h3>
          <p class="text-gray-500">Create your first tournament using the form above.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tournament
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teams/Matches
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="tournament in tournaments" :key="tournament.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ tournament.name }}</div>
                    <div v-if="tournament.description" class="text-sm text-gray-500">{{ tournament.description }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge :color="getStatusColor(tournament.status)" variant="subtle" class="capitalize">
                    {{ tournament.status.replace('_', ' ') }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ tournament.start_date ? formatDate(tournament.start_date) : 'Not set' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ tournament.couples_count || 0 }} teams / {{ tournament.matches_count || 0 }} matches
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <UButton 
                      :to="`/tournaments/${tournament.id}`"
                      size="xs"
                      variant="outline"
                    >
                      View
                    </UButton>
                    
                    <select 
                      class="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @change="handleStatusChange(tournament.id, $event)"
                    >
                      <option value="">Change Status</option>
                      <option value="draft">Set to Draft</option>
                      <option value="in_progress">Start Tournament</option>
                      <option value="completed">Complete Tournament</option>
                      <option value="cancelled">Cancel Tournament</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>
  </div>
</template>
