<script setup lang="ts">
interface User {
  id?: number
  username: string
  email: string
  role: 'admin' | 'client'
  name?: string
  avatar_url?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

definePageMeta({
  auth: true,
  layout: 'admin'
})

// Check if user is admin
// const { data: session } = useAuth()
// TODO: Re-enable role check after auth is fully working
// if (session.value && session.value.user?.role !== 'admin') {
//   throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
// }

// Users data
const users = ref<User[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)

// Form data
const newUser = ref({
  username: '',
  email: '',
  password: '',
  role: 'client' as 'admin' | 'client',
  name: ''
})

const resetForm = () => {
  newUser.value = {
    username: '',
    email: '',
    password: '',
    role: 'client',
    name: ''
  }
}

// Load users
const loadUsers = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/users') 
    users.value = (response as unknown as { users: User[] })?.users || []
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    isLoading.value = false
  }
}

// Create user
const createUser = async () => {
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: newUser.value
    })
    
    showCreateModal.value = false
    resetForm()
    await loadUsers()
  } catch (error: unknown) {
    console.error('Failed to create user:', error)
    // Handle error display
  }
}

onMounted(() => {
  loadUsers()
})

const columns: { key: string; label: string }[] = [
  { key: 'username', label: 'Username' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'is_active', label: 'Status' },
  { key: 'created_at', label: 'Created' },
  { key: 'actions', label: 'Actions' }
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-600 mt-2">Manage system users and their permissions</p>
      </div>
      <UButton @click="showCreateModal = true" size="lg">
        <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
        Create User
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">All Users</h2>
          <div class="flex items-center space-x-2">
            <UButton @click="loadUsers" variant="soft" size="sm">
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </template>

      <UTable 
        :rows="users" 
        :columns="columns as any"
        :loading="isLoading"
        class="w-full"
      >
        <template #role-data="{ row }">
          <UBadge :color="(row as unknown as User).role === 'admin' ? 'error' : 'primary'">
            {{ (row as unknown as User).role }}
          </UBadge>
        </template>

        <template #is_active-data="{ row }">
          <UBadge :color="(row as unknown as User).is_active ? 'success' : 'neutral'">
            {{ (row as unknown as User).is_active ? 'Active' : 'Inactive' }}
          </UBadge>
        </template>

        <template #created_at-data="{ row }">
          {{ formatDate((row as unknown as User).created_at || '') }}
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center space-x-2">
            <UButton variant="soft" size="sm">
              <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
            </UButton>
            <UButton 
              v-if="(row as unknown as User).is_active" 
              variant="soft" 
              color="warning" 
              size="sm"
            >
              <UIcon name="i-heroicons-pause" class="w-4 h-4" />
            </UButton>
            <UButton 
              v-else 
              variant="soft" 
              color="success" 
              size="sm"
            >
              <UIcon name="i-heroicons-play" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Create User Modal -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create New User</h3>
        </template>

        <form @submit.prevent="createUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <UInput 
              v-model="newUser.username" 
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <UInput 
              v-model="newUser.email" 
              type="email" 
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <UInput 
              v-model="newUser.password" 
              type="password" 
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <UInput 
              v-model="newUser.name" 
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <USelect
              v-model="newUser.role"
              :options="[
                { label: 'Client', value: 'client' },
                { label: 'Admin', value: 'admin' }
              ]"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <UButton 
              type="button" 
              variant="soft" 
              @click="showCreateModal = false"
            >
              Cancel
            </UButton>
            <UButton type="submit">
              Create User
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
