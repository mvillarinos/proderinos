import type { PredictionDeleteResponse } from '#shared/types'

export const useDeletePrediction = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const deletePrediction = async (predictionId: number): Promise<PredictionDeleteResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<PredictionDeleteResponse>(`/api/predictions/${predictionId}`, {
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
    deletePrediction
  }
}
