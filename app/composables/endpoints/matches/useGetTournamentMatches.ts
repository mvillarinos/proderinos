import type { MatchesResponse } from '#shared/types'

export const useGetTournamentMatches = (tournamentId: MaybeRef<number>) => {
  const id = computed(() => unref(tournamentId))
  
  const { data, pending, error, refresh } = useLazyFetch<MatchesResponse>(
    () => `/api/tournaments/${id.value}/matches`,
    {
      watch: [id]
    }
  )

  return {
    matches: computed(() => data.value?.matches || []),
    pending: readonly(pending),
    error: readonly(error),
    refresh
  }
}
