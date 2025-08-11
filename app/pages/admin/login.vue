<script setup lang="ts">
definePageMeta({
  auth: false,
  layout: 'admin'
})

const { signIn, status } = useAuth()

const form = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.username || !form.password) {
    error.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const result = await signIn('credentials', {
      username: form.username,
      password: form.password,
      redirect: false
    })

    if (result?.error) {
      error.value = 'Invalid credentials'
    } else {
      await navigateTo('/admin')
    }
  } catch {
    error.value = 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Redirect if already authenticated
watchEffect(() => {
  if (status.value === 'authenticated') {
    navigateTo('/admin')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">VillaBet</h1>
        <h2 class="text-xl font-semibold text-gray-600">Admin Login</h2>
        <p class="text-gray-500 mt-2">Sign in to manage tournaments and betting</p>
        <p class="text-sm text-blue-600 mt-1">First user will automatically become admin</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <UInput
              v-model="form.username"
              type="text"
              placeholder="Enter username"
              :disabled="isLoading"
              size="lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Enter password"
              :disabled="isLoading"
              size="lg"
            />
          </div>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :description="error"
            class="mb-4"
          />

          <UButton
            type="submit"
            :loading="isLoading"
            :disabled="isLoading"
            block
            size="lg"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </UButton>
        </form>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500 text-center">
            First login creates your admin account
          </p>
          <p class="text-xs text-gray-400 text-center mt-1">
            Subsequent users can be created through the admin panel
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
