import type { PredictionsResponse } from '#shared/types'

export const useGetAllPredictions = () => {
  const { data, pending, error, refresh } = useLazyFetch<PredictionsResponse>('/api/predictions')

  return {
    predictions: computed(() => data.value?.predictions || []),
    pending: readonly(pending),
    error: readonly(error),
    refresh
  }
}
