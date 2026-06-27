import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createHash } from 'crypto'
import { Contour, smoothLines, isolines, isobands } from '../src/index'
import type PolyLine from '../src/contour/global/PolyLine'
import type Polygon from '../src/contour/global/Polygon'

// Load test data once (the raw JSON is read-only)
const rawData = JSON.parse(readFileSync(resolve(__dirname, '../public/data.json'), 'utf-8')) as {
  gridOptions: typeof gridOptionsType
  data: number[][]
}

// Extract gridOptions type for TypeScript
const gridOptionsType = {
  xStart: 0,
  xEnd: 0,
  xDelta: 0,
  yStart: 0,
  yEnd: 0,
  yDelta: 0,
  xSize: 0,
  ySize: 0,
}
type GridOptions = typeof gridOptionsType

/**
 * Load a fresh deep copy of the test data.
 * The Contour constructor and tracingContourLines mutate the data array in-place
 * (adding a small dShift to each value), so each test must get its own copy.
 */
function loadData(): { gridOptions: GridOptions; data: number[][] } {
  return JSON.parse(JSON.stringify(rawData))
}

/**
 * Compute a short deterministic hash of arbitrary serializable data.
 * This detects any numerical change in coordinates without storing
 * the full (potentially huge) output in the snapshot.
 */
function hash(data: unknown): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex').substring(0, 16)
}

/**
 * Compute the bounding box [xmin, ymin, xmax, ymax] of a coordinate list.
 */
function bbox(coords: number[][]): [number, number, number, number] {
  let xmin = Infinity
  let ymin = Infinity
  let xmax = -Infinity
  let ymax = -Infinity
  for (const [x, y] of coords) {
    if (x < xmin) xmin = x
    if (x > xmax) xmax = x
    if (y < ymin) ymin = y
    if (y > ymax) ymax = y
  }
  return [xmin, ymin, xmax, ymax]
}

describe('Golden snapshot — full Contour pipeline', () => {
  const breaks = [-10, 0, 10, 20, 30, 40]

  it('produces stable contour lines (tracingContourLines)', () => {
    const { gridOptions, data } = loadData()
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < gridOptions.xSize; i++) {
      xs.push(gridOptions.xStart + i * gridOptions.xDelta)
    }
    for (let i = 0; i < gridOptions.ySize; i++) {
      ys.push(gridOptions.yStart + i * gridOptions.yDelta)
    }

    const contour = new Contour(data, xs, ys, 999999)
    const contours = contour.tracingContourLines(breaks)

    // Group by break value for a readable summary
    const byValue = new Map<number, number>()
    for (const line of contours) {
      byValue.set(line.value, (byValue.get(line.value) ?? 0) + 1)
    }

    const summary = {
      totalLines: contours.length,
      linesByValue: Object.fromEntries([...byValue.entries()].sort((a, b) => a[0] - b[0])),
      typeBreakdown: contours.reduce(
        (acc, line) => {
          acc[line.type] = (acc[line.type] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      totalPoints: contours.reduce((sum, l) => sum + l.pointList.length, 0),
      coordinatesHash: hash(contours.map((l) => l.pointList.map((p) => [p.x, p.y]))),
    }

    expect(summary).toMatchSnapshot()
  })

  it('produces stable smoothed lines (smoothLines)', () => {
    const { gridOptions, data } = loadData()
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < gridOptions.xSize; i++) {
      xs.push(gridOptions.xStart + i * gridOptions.xDelta)
    }
    for (let i = 0; i < gridOptions.ySize; i++) {
      ys.push(gridOptions.yStart + i * gridOptions.yDelta)
    }

    const contour = new Contour(data, xs, ys, 999999)
    const contours = contour.tracingContourLines(breaks)
    const beforeCount = contours.reduce((s, l) => s + l.pointList.length, 0)
    smoothLines(contours)
    const afterCount = contours.reduce((s, l) => s + l.pointList.length, 0)

    const summary = {
      linesCount: contours.length,
      totalPointsBeforeSmoothing: beforeCount,
      totalPointsAfterSmoothing: afterCount,
      coordinatesHash: hash(contours.map((l) => l.pointList.map((p) => [p.x, p.y]))),
    }

    expect(summary).toMatchSnapshot()
  })

  it('produces stable polygons (tracingPolygons)', () => {
    const { gridOptions, data } = loadData()
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < gridOptions.xSize; i++) {
      xs.push(gridOptions.xStart + i * gridOptions.xDelta)
    }
    for (let i = 0; i < gridOptions.ySize; i++) {
      ys.push(gridOptions.yStart + i * gridOptions.yDelta)
    }

    const contour = new Contour(data, xs, ys, 999999)
    const contours = contour.tracingContourLines(breaks)
    smoothLines(contours)
    const polygons = contour.tracingPolygons(contours, breaks)

    const summary = {
      totalPolygons: polygons.length,
      borderPolygons: polygons.filter((p) => p.isBorder).length,
      polygonsWithHoles: polygons.filter((p) => p.hasHoles()).length,
      highCenterCount: polygons.filter((p) => p.isHighCenter).length,
      valueDistribution: (() => {
        const m = new Map<string, number>()
        for (const p of polygons) {
          const key = `${p.lowValue}_${p.highValue}`
          m.set(key, (m.get(key) ?? 0) + 1)
        }
        return Object.fromEntries([...m.entries()].sort())
      })(),
      totalOutlinePoints: polygons.reduce((s, p) => s + p.outLine.pointList.length, 0),
      totalHolePoints: polygons.reduce((s, p) => s + p.holeLines.reduce((ss, h) => ss + h.pointList.length, 0), 0),
      coordinatesHash: hash(
        polygons.map((p) => ({
          outLine: p.outLine.pointList.map((pt) => [pt.x, pt.y]),
          holes: p.holeLines.map((h) => h.pointList.map((pt) => [pt.x, pt.y])),
          lowValue: p.lowValue,
          highValue: p.highValue,
          isHighCenter: p.isHighCenter,
          isBorder: p.isBorder,
        }))
      ),
    }

    expect(summary).toMatchSnapshot()
  })

  it('produces stable isolines GeoJSON', () => {
    const { gridOptions, data } = loadData()
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < gridOptions.xSize; i++) {
      xs.push(gridOptions.xStart + i * gridOptions.xDelta)
    }
    for (let i = 0; i < gridOptions.ySize; i++) {
      ys.push(gridOptions.yStart + i * gridOptions.yDelta)
    }

    const contour = new Contour(data, xs, ys, 999999)
    const contours = contour.tracingContourLines(breaks)
    smoothLines(contours)
    const lineFC = isolines(contours as PolyLine[])

    expect(lineFC.type).toBe('FeatureCollection')

    const summary = {
      type: lineFC.type,
      featureCount: lineFC.features.length,
      features: lineFC.features.map((f) => ({
        value: f.properties?.value,
        pointCount: f.geometry.coordinates.length,
        bbox: bbox(f.geometry.coordinates),
      })),
      coordinatesHash: hash(lineFC.features.map((f) => f.geometry.coordinates)),
    }

    expect(summary).toMatchSnapshot()
  })

  it('produces stable isobands GeoJSON', () => {
    const { gridOptions, data } = loadData()
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < gridOptions.xSize; i++) {
      xs.push(gridOptions.xStart + i * gridOptions.xDelta)
    }
    for (let i = 0; i < gridOptions.ySize; i++) {
      ys.push(gridOptions.yStart + i * gridOptions.yDelta)
    }

    const contour = new Contour(data, xs, ys, 999999)
    const contours = contour.tracingContourLines(breaks)
    smoothLines(contours)
    const polygons = contour.tracingPolygons(contours as PolyLine[], breaks)
    const polyFC = isobands(polygons as Polygon[], breaks)

    expect(polyFC.type).toBe('FeatureCollection')

    const summary = {
      type: polyFC.type,
      featureCount: polyFC.features.length,
      features: polyFC.features.map((f) => ({
        value: f.properties?.value,
        ringCount: f.geometry.coordinates.length,
        outerRingPoints: f.geometry.coordinates[0].length,
        bbox: bbox(f.geometry.coordinates[0]),
      })),
      coordinatesHash: hash(polyFC.features.map((f) => f.geometry.coordinates)),
    }

    expect(summary).toMatchSnapshot()
  })
})
