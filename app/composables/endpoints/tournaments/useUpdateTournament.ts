import type { TournamentPatchBody, TournamentResponse } from '#shared/types'

export const useUpdateTournament = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const updateTournament = async (tournamentId: number, tournamentData: TournamentPatchBody): Promise<TournamentResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<TournamentResponse>(`/api/tournaments/${tournamentId}`, {
        method: 'PATCH',
        body: tournamentData
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
    updateTournament
  }
}
