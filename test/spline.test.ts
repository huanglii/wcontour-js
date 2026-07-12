import { describe, it, expect } from 'vitest'
import PointD from '../src/contour/global/PointD'
import { BSplineScanning } from '../src/contour/utils/spline'
import { smoothPoints } from '../src/contour/utils/contour'

describe('BSplineScanning', () => {
  it('returns a copy (not the same reference) for fewer than 4 points', () => {
    const points = [new PointD(0, 0), new PointD(1, 1), new PointD(2, 2)]
    const result = BSplineScanning(points, points.length)
    // 纯函数：返回副本而非原引用
    expect(result).not.toBe(points)
    expect(result.length).toBe(points.length)
    for (let i = 0; i < points.length; i++) {
      expect(result[i].x).toBeCloseTo(points[i].x, 10)
      expect(result[i].y).toBeCloseTo(points[i].y, 10)
    }
    // 输入数组不应被修改
    expect(points[0].x).toBe(0)
  })

  it('smooths a simple open polyline with 4+ points', () => {
    const points = [new PointD(0, 0), new PointD(10, 5), new PointD(20, 15), new PointD(30, 10), new PointD(40, 0)]
    const result = BSplineScanning([...points], points.length)
    // Result should have more points than input (interpolation)
    expect(result.length).toBeGreaterThan(points.length)
    // First and last points should match input endpoints
    expect(result[0].x).toBeCloseTo(points[0].x, 5)
    expect(result[0].y).toBeCloseTo(points[0].y, 5)
    expect(result[result.length - 1].x).toBeCloseTo(points[points.length - 1].x, 5)
    expect(result[result.length - 1].y).toBeCloseTo(points[points.length - 1].y, 5)
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
    const extendedLengthBefore = extended.length
    const result = BSplineScanning(extended, extended.length)
    expect(result.length).toBeGreaterThan(0)
    // Closed path: last point should equal first
    expect(result[0].x).toBeCloseTo(result[result.length - 1].x, 5)
    expect(result[0].y).toBeCloseTo(result[result.length - 1].y, 5)
    // 输入数组不应被修改
    expect(extended.length).toBe(extendedLengthBefore)
  })

  it('produces deterministic output for the same input', () => {
    const points = [new PointD(0, 0), new PointD(5, 10), new PointD(15, 20), new PointD(25, 15), new PointD(30, 5)]
    const result1 = BSplineScanning([...points], points.length)
    const result2 = BSplineScanning([...points], points.length)
    expect(result1.length).toBe(result2.length)
    for (let i = 0; i < result1.length; i++) {
      expect(result1[i].x).toBeCloseTo(result2[i].x, 10)
      expect(result1[i].y).toBeCloseTo(result2[i].y, 10)
    }
  })
})

describe('smoothPoints', () => {
  it('smooths a point list and returns more points', () => {
    const points = [new PointD(0, 0), new PointD(10, 5), new PointD(20, 15), new PointD(30, 10), new PointD(40, 0)]
    const result = smoothPoints(points)
    expect(result.length).toBeGreaterThanOrEqual(points.length)
  })
})
