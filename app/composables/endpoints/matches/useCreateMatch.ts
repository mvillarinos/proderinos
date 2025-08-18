import type { MatchPostBody, MatchResponse } from '#shared/types'

export const useCreateMatch = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const createMatch = async (tournamentId: number, matchData: MatchPostBody): Promise<MatchResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<MatchResponse>(`/api/tournaments/${tournamentId}/matches`, {
        method: 'POST',
        body: matchData
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
    createMatch
  }
}
