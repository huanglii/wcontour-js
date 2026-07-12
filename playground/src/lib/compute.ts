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

  const t_ctor0 = performance.now()
  const contour = new Contour(dataset.data, dataset.xs, dataset.ys, params.undefData)
  const t_ctor = performance.now() - t_ctor0

  const t_lines0 = performance.now()
  let lines = contour.tracingContourLines(params.breaks)
  const t_lines = performance.now() - t_lines0

  let pointCount = 0
  for (const line of lines) {
    pointCount += line.pointList.length
  }

  let t_smooth = 0
  if (params.smooth) {
    const t_smooth0 = performance.now()
    lines = smoothLines(lines)
    t_smooth = performance.now() - t_smooth0
    pointCount = 0
    for (const line of lines) {
      pointCount += line.pointList.length
    }
  }

  const t_polys0 = performance.now()
  const polygons = contour.tracingPolygons(lines, params.breaks)
  const t_polys = performance.now() - t_polys0

  const t_geo0 = performance.now()
  const lineFC = isolines(lines)
  const polyFC = isobands(polygons, params.breaks)
  const t_geo = performance.now() - t_geo0

  const elapsed = performance.now() - t0

  console.table({
    ctor: t_ctor.toFixed(1) + 'ms',
    tracingLines: t_lines.toFixed(1) + 'ms',
    smooth: t_smooth.toFixed(1) + 'ms',
    tracingPolygons: t_polys.toFixed(1) + 'ms',
    geojson: t_geo.toFixed(1) + 'ms',
    total: elapsed.toFixed(1) + 'ms',
    lines: lines.length,
    polygons: polygons.length,
    points: pointCount,
  })

  return {
    lineFC,
    polyFC,
    lineCount: lines.length,
    polyCount: polygons.length,
    pointCount,
    elapsed,
  }
}
