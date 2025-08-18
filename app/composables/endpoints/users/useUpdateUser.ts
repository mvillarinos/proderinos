import type { UserPatchBody, UserResponse } from '#shared/types'

export const useUpdateUser = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const updateUser = async (userId: number, userData: UserPatchBody): Promise<UserResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<UserResponse>(`/api/users/${userId}`, {
        method: 'PATCH',
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
    updateUser
  }
}
