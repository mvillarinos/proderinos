import type { UserRolePatchBody, UserRoleUpdateResponse } from '#shared/types'

export const useUpdateUserRole = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const updateUserRole = async (roleData: UserRolePatchBody): Promise<UserRoleUpdateResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<UserRoleUpdateResponse>('/api/users/role', {
        method: 'PATCH',
        body: roleData
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
    updateUserRole
  }
}
