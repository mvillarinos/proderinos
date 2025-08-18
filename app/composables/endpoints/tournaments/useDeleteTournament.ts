import type { ApiSuccess } from '#shared/types'

export const useDeleteTournament = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const deleteTournament = async (tournamentId: number): Promise<ApiSuccess> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<ApiSuccess>(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE'
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
    deleteTournament
  }
}
