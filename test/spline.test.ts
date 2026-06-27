import { describe, it, expect } from 'vitest'
import PointD from '../src/contour/global/PointD'
import { BSplineScanning } from '../src/contour/utils/spline'
import { smoothPoints } from '../src/contour/utils/contour'

describe('BSplineScanning', () => {
  it('returns null for fewer than 4 points', () => {
    const points = [new PointD(0, 0), new PointD(1, 1), new PointD(2, 2)]
    expect(BSplineScanning(points, points.length)).toBeNull()
  })

  it('smooths a simple open polyline with 4+ points', () => {
    const points = [new PointD(0, 0), new PointD(10, 5), new PointD(20, 15), new PointD(30, 10), new PointD(40, 0)]
    const result = BSplineScanning([...points], points.length)
    expect(result).not.toBeNull()
    // Result should have more points than input (interpolation)
    expect(result!.length).toBeGreaterThan(points.length)
    // First and last points should match input endpoints
    expect(result![0].x).toBeCloseTo(points[0].x, 5)
    expect(result![0].y).toBeCloseTo(points[0].y, 5)
    expect(result![result!.length - 1].x).toBeCloseTo(points[points.length - 1].x, 5)
    expect(result![result!.length - 1].y).toBeCloseTo(points[points.length - 1].y, 5)
  })

  it('smooths a closed polyline (first === last point)', () => {
    const points = [
      new PointD(0, 0),
      new PointD(10, 0),
      new PointD(10, 10),
      new PointD(0, 10),
      new PointD(0, 0), // closed
    ]
    // Need enough points for the closed-path branch; add duplicates as the algorithm does
    const extended = [...points, ...points.slice(0, 7)]
    const result = BSplineScanning(extended, extended.length)
    expect(result).not.toBeNull()
    expect(result!.length).toBeGreaterThan(0)
    // Closed path: last point should equal first
    expect(result![0].x).toBeCloseTo(result![result!.length - 1].x, 5)
    expect(result![0].y).toBeCloseTo(result![result!.length - 1].y, 5)
  })

  it('produces deterministic output for the same input', () => {
    const points = [new PointD(0, 0), new PointD(5, 10), new PointD(15, 20), new PointD(25, 15), new PointD(30, 5)]
    const result1 = BSplineScanning([...points], points.length)
    const result2 = BSplineScanning([...points], points.length)
    expect(result1).not.toBeNull()
    expect(result2).not.toBeNull()
    expect(result1!.length).toBe(result2!.length)
    for (let i = 0; i < result1!.length; i++) {
      expect(result1![i].x).toBeCloseTo(result2![i].x, 10)
      expect(result1![i].y).toBeCloseTo(result2![i].y, 10)
    }
  })
})

describe('smoothPoints', () => {
  it('smooths a point list and returns more points', () => {
    const points = [new PointD(0, 0), new PointD(10, 5), new PointD(20, 15), new PointD(30, 10), new PointD(40, 0)]
    const result = smoothPoints(points)
    expect(result).not.toBeNull()
    expect(result.length).toBeGreaterThanOrEqual(points.length)
  })
})
