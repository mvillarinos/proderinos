import type { MatchResultBody, MatchResponse } from '#shared/types'

export const useUpdateMatchResult = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const updateMatchResult = async (tournamentId: number, matchId: number, resultData: MatchResultBody): Promise<MatchResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<MatchResponse>(`/api/tournaments/${tournamentId}/matches/${matchId}/result`, {
        method: 'PATCH',
        body: resultData
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
    updateMatchResult
  }
}
