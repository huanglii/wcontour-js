import { useMemo } from 'react'
import type { GridDataset } from '../lib/datasets'
import { computeContour, type ContourParams } from '../lib/compute'

export function useContour(dataset: GridDataset | null, params: ContourParams) {
  return useMemo(() => {
    if (!dataset) return null
    return computeContour(dataset, params)
  }, [dataset, params.breaks, params.undefData, params.smooth])
}
