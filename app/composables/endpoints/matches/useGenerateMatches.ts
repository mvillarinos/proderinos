import type { MatchGenerateResponse } from '#shared/types'

export const useGenerateMatches = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const generateMatches = async (tournamentId: number): Promise<MatchGenerateResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<MatchGenerateResponse>(`/api/tournaments/${tournamentId}/matches/generate`, {
        method: 'POST'
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
    generateMatches
  }
}
