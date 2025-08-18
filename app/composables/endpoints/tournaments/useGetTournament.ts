import type { TournamentResponse } from '#shared/types'

export const useGetTournament = (tournamentId: MaybeRef<number>) => {
  const id = computed(() => unref(tournamentId))
  
  const { data, pending, error, refresh } = useLazyFetch<TournamentResponse>(
    () => `/api/tournaments/${id.value}`,
    {
      watch: [id]
    }
  )

  return {
    tournament: computed(() => data.value?.tournament),
    pending: readonly(pending),
    error: readonly(error),
    refresh
  }
}
