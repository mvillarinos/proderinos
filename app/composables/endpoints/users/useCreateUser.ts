import type { UserPostBody, UserResponse } from '#shared/types'

export const useCreateUser = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const createUser = async (userData: UserPostBody): Promise<UserResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<UserResponse>('/api/users', {
        method: 'POST',
        body: userData
      })
      
      return response
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      pending.value = false
    }
  }

  return {
    pending: readonly(pending),
    error: readonly(error),
    createUser
  }
}
