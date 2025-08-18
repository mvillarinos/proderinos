import type { PredictionPostBody, PredictionResponse } from '#shared/types'

export const useCreatePrediction = () => {
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const createPrediction = async (predictionData: PredictionPostBody): Promise<PredictionResponse> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await $fetch<PredictionResponse>('/api/predictions', {
        method: 'POST',
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
    createPrediction
  }
}
