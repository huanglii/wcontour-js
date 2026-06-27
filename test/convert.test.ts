import { describe, it, expect } from 'vitest'
import PointD from '../src/contour/global/PointD'
import PolyLine from '../src/contour/global/PolyLine'
import Polygon from '../src/contour/global/Polygon'
import { isolines, isobands } from '../src/contour/utils/convert'

describe('isolines', () => {
  it('converts polylines to GeoJSON LineString FeatureCollection', () => {
    const line1 = new PolyLine()
    line1.value = 10
    line1.pointList = [new PointD(0, 0), new PointD(5, 5), new PointD(10, 0)]
    const line2 = new PolyLine()
    line2.value = 20
    line2.pointList = [new PointD(1, 1), new PointD(2, 2), new PointD(3, 1)]

    const fc = isolines([line1, line2])

    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(2)
    expect(fc.features[0].geometry.type).toBe('LineString')
    expect(fc.features[0].geometry.coordinates).toEqual([
      [0, 0],
      [5, 5],
      [10, 0],
    ])
    expect(fc.features[0].properties?.value).toBe(10)
    expect(fc.features[1].properties?.value).toBe(20)
  })

  it('returns empty FeatureCollection for empty input', () => {
    const fc = isolines([])
    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(0)
  })

  it('preserves coordinate order', () => {
    const line = new PolyLine()
    line.value = 5
    line.pointList = [new PointD(1, 2), new PointD(3, 4), new PointD(5, 6), new PointD(7, 8)]

    const fc = isolines([line])
    expect(fc.features[0].geometry.coordinates).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ])
  })
})

describe('isobands', () => {
  it('converts polygons to GeoJSON Polygon FeatureCollection', () => {
    const polygon = new Polygon()
    polygon.lowValue = 10
    polygon.highValue = 20
    polygon.isHighCenter = true
    polygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 10),
      new PointD(10, 10),
      new PointD(10, 0),
      new PointD(0, 0),
    ]

    const breaks = [0, 10, 20, 30]
    const fc = isobands([polygon], breaks)

    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(1)
    expect(fc.features[0].geometry.type).toBe('Polygon')
    // isHighCenter=true with lowValue=10 in breaks -> value = breaks[idx+1] = 20
    expect(fc.features[0].properties?.value).toBe(20)
    expect(fc.features[0].geometry.coordinates[0]).toEqual([
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ])
  })

  it('returns empty FeatureCollection for empty input', () => {
    const fc = isobands([], [0, 10, 20])
    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(0)
  })

  it('includes hole coordinates when polygon has holes', () => {
    const polygon = new Polygon()
    polygon.lowValue = 0
    polygon.highValue = 10
    polygon.isHighCenter = false
    polygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 20),
      new PointD(20, 20),
      new PointD(20, 0),
      new PointD(0, 0),
    ]
    const holeLine = new PolyLine()
    holeLine.pointList = [new PointD(5, 5), new PointD(5, 15), new PointD(15, 15), new PointD(15, 5), new PointD(5, 5)]
    polygon.holeLines.push(holeLine)

    const breaks = [0, 10, 20]
    const fc = isobands([polygon], breaks)

    expect(fc.features[0].geometry.coordinates).toHaveLength(2) // outer ring + hole
    expect(fc.features[0].geometry.coordinates[1][0]).toEqual([5, 5])
  })

  it('handles isHighCenter=false correctly (value = outLine.value)', () => {
    const polygon = new Polygon()
    polygon.lowValue = 10
    polygon.highValue = 20
    polygon.isHighCenter = false
    polygon.outLine.value = 10
    polygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(10, 0),
      new PointD(10, 10),
      new PointD(0, 10),
      new PointD(0, 0),
    ]

    const breaks = [0, 10, 20, 30]
    const fc = isobands([polygon], breaks)
    // isHighCenter=false -> value stays as outLine.value
    expect(fc.features[0].properties?.value).toBe(10)
  })
})
