import type { TournamentsResponse } from '#shared/types'

export const useGetAllTournaments = () => {
  const { data, pending, error, refresh } = useLazyFetch<TournamentsResponse>('/api/tournaments')

  return {
    tournaments: computed(() => data.value?.tournaments || []),
    pending: readonly(pending),
    error: readonly(error),
    refresh
  }
}
