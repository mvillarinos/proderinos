import type { CouplePostBody, CoupleResponse } from '#shared/types'

export const useCreateCouple = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const createCouple = async (tournamentId: number, coupleData: CouplePostBody): Promise<CoupleResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<CoupleResponse>(`/api/tournaments/${tournamentId}/couples`, {
        method: 'POST',
        body: coupleData
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
    createCouple
  }
}
