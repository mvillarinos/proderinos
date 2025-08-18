import type { UsersResponse } from '#shared/types'

export const useGetAllUsers = () => {
  const { data, pending, error, refresh } = useLazyFetch<UsersResponse>('/api/users')

  return {
    users: computed(() => data.value?.users || []),
    pending: readonly(pending),
    error: readonly(error),
    refresh
  }
}
