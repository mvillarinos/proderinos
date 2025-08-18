import type { TournamentPostBody, TournamentResponse } from '#shared/types'

export const useCreateTournament = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const createTournament = async (tournamentData: TournamentPostBody): Promise<TournamentResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<TournamentResponse>('/api/tournaments', {
        method: 'POST',
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
    createTournament
  }
}
