<script setup lang="ts">
definePageMeta({
  auth: true
})

const { data: session, signOut } = useAuth()

// Check if user is admin
watchEffect(() => {
  // TODO: Re-enable role check after auth is fully working
  // if (session.value && session.value.user?.role !== 'admin') {
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: 'Access denied. Admin role required.'
  //   })
  // }
})

const handleLogout = async () => {
  await signOut({ callbackUrl: '/' })
}

// Dashboard stats
const stats = ref({
  tournaments: 0,
  users: 0,
  predictions: 0,
  matches: 0
})

const loadStats = async () => {
  try {
    const [tournamentsData, usersData, predictionsData, matchesData] = await Promise.all([
      $fetch('/api/tournaments'),
      $fetch('/api/users'),
      $fetch('/api/betting/predictions'),
      $fetch('/api/tournaments/1/matches') // Assuming tournament with ID 1 exists
    ])
    
    stats.value = {
      tournaments: Array.isArray(tournamentsData) ? tournamentsData.length : 0,
      users: Array.isArray((usersData as { users: unknown[] })?.users) ? (usersData as { users: unknown[] }).users.length : 0,
      predictions: (predictionsData as unknown as { total: number })?.total || 0,
      matches: Array.isArray(matchesData) ? matchesData.length : 0
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

onMounted(() => {
  loadStats()
})

const menuItems = [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/admin'
  },
  {
    label: 'Tournaments',
    icon: 'i-heroicons-trophy',
    to: '/admin/tournaments'
  },
  {
    label: 'Users',
    icon: 'i-heroicons-users',
    to: '/admin/users'
  },
  {
    label: 'Predictions',
    icon: 'i-heroicons-chart-bar',
    to: '/admin/predictions'
  },
  {
    label: 'Leaderboard',
    icon: 'i-heroicons-star',
    to: '/admin/leaderboard'
  }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">VillaBet Admin</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              Welcome, {{ session?.user?.name }}
            </span>
            <UButton
              variant="ghost"
              color="neutral"
              @click="handleLogout"
            >
              Logout
            </UButton>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-sm min-h-screen">
        <nav class="mt-8">
          <div class="px-4 space-y-2">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100"
              active-class="bg-blue-50 text-blue-700 border-r-2 border-blue-700"
            >
              <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-8">
        <div class="max-w-7xl mx-auto">
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p class="text-gray-600">Manage your padel tournament betting system</p>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-500">Tournaments</h3>
                  <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-blue-500" />
                </div>
              </template>
              <div class="text-2xl font-bold text-gray-900">{{ stats.tournaments }}</div>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-500">Users</h3>
                  <UIcon name="i-heroicons-users" class="w-5 h-5 text-green-500" />
                </div>
              </template>
              <div class="text-2xl font-bold text-gray-900">{{ stats.users }}</div>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-500">Predictions</h3>
                  <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-purple-500" />
                </div>
              </template>
              <div class="text-2xl font-bold text-gray-900">{{ stats.predictions }}</div>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-500">Matches</h3>
                  <UIcon name="i-heroicons-play" class="w-5 h-5 text-orange-500" />
                </div>
              </template>
              <div class="text-2xl font-bold text-gray-900">{{ stats.matches }}</div>
            </UCard>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold text-gray-900">Tournament Management</h3>
              </template>
              <p class="text-gray-600 mb-4">Create and manage padel tournaments</p>
              <UButton to="/admin/tournaments" block>
                Manage Tournaments
              </UButton>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
              </template>
              <p class="text-gray-600 mb-4">Add and manage system users</p>
              <UButton to="/admin/users" block>
                Manage Users
              </UButton>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold text-gray-900">Betting Management</h3>
              </template>
              <p class="text-gray-600 mb-4">Handle predictions and leaderboards</p>
              <UButton to="/admin/predictions" block>
                Manage Bets
              </UButton>
            </UCard>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
