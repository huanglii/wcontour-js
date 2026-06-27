// 封装 wcontour 计算流程
import { Contour, smoothLines, isolines, isobands } from 'wcontour-js'
import type { GridDataset } from './datasets'

export interface ContourParams {
  breaks: number[]
  undefData: number
  smooth: boolean
}

export interface ContourResult {
  lineFC: GeoJSON.FeatureCollection<GeoJSON.LineString>
  polyFC: GeoJSON.FeatureCollection<GeoJSON.Polygon>
  lineCount: number
  polyCount: number
  pointCount: number
  elapsed: number
}

export function computeContour(dataset: GridDataset, params: ContourParams): ContourResult {
  const t0 = performance.now()

  const contour = new Contour(dataset.data, dataset.xs, dataset.ys, params.undefData)
  let lines = contour.tracingContourLines(params.breaks)

  let pointCount = 0
  for (const line of lines) {
    pointCount += line.pointList.length
  }

  if (params.smooth) {
    lines = smoothLines(lines)
    pointCount = 0
    for (const line of lines) {
      pointCount += line.pointList.length
    }
  }

  const polygons = contour.tracingPolygons(lines, params.breaks)
  const lineFC = isolines(lines)
  const polyFC = isobands(polygons, params.breaks)

  const elapsed = performance.now() - t0

  return {
    lineFC,
    polyFC,
    lineCount: lines.length,
    polyCount: polygons.length,
    pointCount,
    elapsed,
  }
}
