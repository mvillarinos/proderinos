<script setup lang="ts">
// Default layout with header navigation
const { data: session, signOut } = useAuth()

const handleLogout = async () => {
  await signOut({ callbackUrl: '/' })
}

// Type-safe user access with our extended auth types
const user = computed(() => session.value?.user as {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string
  role?: string
} | undefined)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Modern Navigation Header -->
    <header class="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <UContainer>
        <div class="flex items-center justify-between py-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <UIcon name="i-heroicons-trophy" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Villabet
              </h1>
              <p class="text-xs text-slate-500 -mt-1">Tournament Manager</p>
            </div>
          </div>
          
          <nav class="flex items-center space-x-3">
            <UButton 
              to="/" 
              variant="ghost" 
              size="sm"
              class="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg"
            >
              <UIcon name="i-heroicons-home" class="w-4 h-4 mr-2" />
              Home
            </UButton>
            <UButton 
              to="/tournaments" 
              variant="ghost" 
              size="sm"
              class="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg"
            >
              <UIcon name="i-heroicons-trophy" class="w-4 h-4 mr-2" />
              Tournaments
            </UButton>
            
            <!-- User Avatar and Authentication -->
            <div class="flex items-center">
              <template v-if="user">
                <!-- Logged in user avatar with dropdown -->
                <UPopover mode="click" :popper="{ placement: 'bottom-end' }">
                  <UButton 
                    variant="ghost" 
                    size="sm"
                    class="p-1.5 hover:bg-blue-50 transition-all duration-200 rounded-full"
                  >
                    <UAvatar 
                      :src="user.image || ''"
                      :alt="user.name || user.username || 'User'"
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
                            :alt="user.name || user.username || 'User'"
                            size="sm"
                          >
                            <template #fallback>
                              <UIcon name="i-heroicons-user" class="w-4 h-4 text-slate-600" />
                            </template>
                          </UAvatar>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-slate-900 truncate">
                              {{ user.name || user.username || 'User' }}
                            </p>
                            <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
                            <p v-if="user.role" class="text-xs text-blue-600 font-medium capitalize">
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
                          @click="navigateTo('/profile')"
                        >
                          <UIcon name="i-heroicons-user-circle" class="w-4 h-4 mr-2" />
                          Profile
                        </UButton>
                        
                        <UButton 
                          v-if="user.role === 'admin'"
                          variant="ghost" 
                          size="sm"
                          class="w-full justify-start"
                          @click="navigateTo('/admin')"
                        >
                          <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-2" />
                          Admin Panel
                        </UButton>
                        
                        <!-- Simple divider -->
                        <hr class="my-2 border-gray-200">
                        
                        <UButton 
                          variant="ghost" 
                          size="sm"
                          class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          @click="handleLogout"
                        >
                          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
                          Sign Out
                        </UButton>
                      </div>
                    </UCard>
                  </template>
                </UPopover>
              </template>
              
              <template v-else>
                <!-- Not logged in - show login button -->
                <UButton 
                  to="/admin/login" 
                  variant="outline" 
                  size="sm"
                  class="text-blue-600 border-blue-300 hover:bg-blue-50 transition-all duration-200 rounded-lg"
                >
                  <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
                  Sign In
                </UButton>
              </template>
            </div>
          </nav>
        </div>
      </UContainer>
    </header>
    
    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>
    
    <!-- Modern Footer -->
    <footer class="bg-white/80 backdrop-blur-sm border-t border-slate-200 mt-16">
      <UContainer>
        <div class="py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; 2025 Villabet. Tournament management made simple.</p>
          <p class="mt-2 sm:mt-0">Built with Nuxt & Tailwind CSS</p>
        </div>
      </UContainer>
    </footer>
  </div>
</template>
