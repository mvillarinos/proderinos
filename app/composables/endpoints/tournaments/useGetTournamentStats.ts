import type { TournamentStatsResponse } from '#shared/types'

export const useGetTournamentStats = (tournamentId: MaybeRef<number>) => {
  const id = computed(() => unref(tournamentId))
  
  const { data, pending, error, refresh } = useLazyFetch<TournamentStatsResponse>(
    () => `/api/tournaments/${id.value}/stats`,
    {
      watch: [id]
    }
  )

  return {
    tournament: computed(() => data.value?.tournament),
    stats: computed(() => data.value?.stats),
    pending: readonly(pending),
    error: readonly(error),
    refresh
  }
}
