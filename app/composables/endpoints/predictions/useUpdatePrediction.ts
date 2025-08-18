import type { PredictionPatchBody, PredictionResponse } from '#shared/types'

export const useUpdatePrediction = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const updatePrediction = async (predictionId: number, predictionData: PredictionPatchBody): Promise<PredictionResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<PredictionResponse>(`/api/predictions/${predictionId}`, {
        method: 'PATCH',
        body: predictionData
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
    updatePrediction
  }
}
