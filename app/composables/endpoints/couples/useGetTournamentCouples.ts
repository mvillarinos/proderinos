import type { CouplesResponse } from '#shared/types'

export const useGetTournamentCouples = (tournamentId: MaybeRef<number>) => {
  const id = computed(() => unref(tournamentId))
  
  const { data, pending, error, refresh } = useLazyFetch<CouplesResponse>(
    () => `/api/tournaments/${id.value}/couples`,
    {
      watch: [id]
    }
  )

  return {
    couples: computed(() => data.value?.couples || []),
    pending: readonly(pending),
    error: readonly(error),
    refresh
  }
}
