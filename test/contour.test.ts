import { describe, expect, it } from 'vitest'
import PointD from '../src/contour/global/PointD'
import PolyLine from '../src/contour/global/PolyLine'
import { smoothLines } from '../src/contour/utils/contour'
import { Contour } from '../src/index'

// ---------------------------------------------------------------------------
// smoothLines — edge cases for the public smoothing API
// ---------------------------------------------------------------------------

describe('smoothLines', () => {
  it('returns empty array for empty input', () => {
    expect(smoothLines([])).toHaveLength(0)
  })

  it('skips lines with 0 points', () => {
    const line = new PolyLine()
    line.value = 10
    line.pointList = []
    const result = smoothLines([line])
    expect(result).toHaveLength(0)
  })

  it('skips lines with 1 point', () => {
    const line = new PolyLine()
    line.value = 10
    line.pointList = [new PointD(0, 0)]
    const result = smoothLines([line])
    expect(result).toHaveLength(0)
  })

  it('smooths a 2-point line (inserts intermediate points then BSpline)', () => {
    const line = new PolyLine()
    line.value = 5
    line.pointList = [new PointD(0, 0), new PointD(40, 0)]
    const result = smoothLines([line])
    expect(result).toHaveLength(1)
    // BSplineScanning on 4 points (2 original + 2 inserted) produces > 2 points
    expect(result[0].pointList.length).toBeGreaterThan(2)
    // Endpoints should be preserved
    expect(result[0].pointList[0].x).toBeCloseTo(0, 5)
    expect(result[0].pointList[result[0].pointList.length - 1].x).toBeCloseTo(40, 5)
  })

  it('smooths a 3-point line (inserts one intermediate point then BSpline)', () => {
    const line = new PolyLine()
    line.value = 5
    line.pointList = [new PointD(0, 0), new PointD(20, 10), new PointD(40, 0)]
    const result = smoothLines([line])
    expect(result).toHaveLength(1)
    expect(result[0].pointList.length).toBeGreaterThan(3)
  })

  it('smooths a 4+ point line directly via BSpline', () => {
    const line = new PolyLine()
    line.value = 5
    line.pointList = [new PointD(0, 0), new PointD(10, 5), new PointD(20, 15), new PointD(30, 10), new PointD(40, 0)]
    const result = smoothLines([line])
    expect(result).toHaveLength(1)
    expect(result[0].pointList.length).toBeGreaterThanOrEqual(5)
  })

  it('handles mixed input (skip invalid, smooth valid)', () => {
    const empty = new PolyLine()
    empty.pointList = []

    const twoPoint = new PolyLine()
    twoPoint.value = 10
    twoPoint.pointList = [new PointD(0, 0), new PointD(10, 10)]

    const fivePoint = new PolyLine()
    fivePoint.value = 20
    fivePoint.pointList = [
      new PointD(0, 0),
      new PointD(5, 10),
      new PointD(15, 20),
      new PointD(25, 15),
      new PointD(30, 5),
    ]

    const result = smoothLines([empty, twoPoint, fivePoint])
    // empty is skipped, twoPoint and fivePoint are smoothed
    expect(result).toHaveLength(2)
    expect(result[0].value).toBe(10)
    expect(result[1].value).toBe(20)
  })

  it('does NOT modify the original line objects (pure function)', () => {
    const line = new PolyLine()
    line.value = 5
    const originalPoints = [
      new PointD(0, 0),
      new PointD(10, 5),
      new PointD(20, 15),
      new PointD(30, 10),
      new PointD(40, 0),
    ]
    line.pointList = [...originalPoints]
    const originalLength = line.pointList.length

    const result = smoothLines([line])
    // 原始线对象不应被修改
    expect(line.pointList.length).toBe(originalLength)
    for (let i = 0; i < originalPoints.length; i++) {
      expect(line.pointList[i].x).toBe(originalPoints[i].x)
      expect(line.pointList[i].y).toBe(originalPoints[i].y)
    }
    // 返回的是新对象（克隆），且点数应增多
    expect(result).toHaveLength(1)
    expect(result[0]).not.toBe(line)
    expect(result[0].pointList.length).toBeGreaterThan(originalLength)
  })
})

// ---------------------------------------------------------------------------
// Contour — small controlled grid integration tests
// ---------------------------------------------------------------------------

describe('Contour — small controlled grid', () => {
  // 5×5 grid with a simple horizontal gradient: value = x * 10
  // xs = [0, 10, 20, 30, 40], ys = [0, 1, 2, 3, 4]
  const xs = [0, 10, 20, 30, 40]
  const ys = [0, 1, 2, 3, 4]
  const undefData = 999999

  function makeGradientGrid(): number[][] {
    const grid: number[][] = []
    for (let i = 0; i < 5; i++) {
      grid[i] = []
      for (let j = 0; j < 5; j++) {
        grid[i][j] = j * 10 // 0, 10, 20, 30, 40
      }
    }
    return grid
  }

  it('traces contour lines for a horizontal gradient', () => {
    const data = makeGradientGrid()
    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30]
    const lines = contour.tracingContourLines(breaks)

    // Should produce contour lines
    expect(lines.length).toBeGreaterThan(0)

    // All lines should have at least 2 points
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }

    // Should have lines for each break value
    const values = new Set(lines.map((l) => l.value))
    for (const b of breaks) {
      expect(values.has(b)).toBe(true)
    }

    // All lines should be Border or Close type
    for (const line of lines) {
      expect(['Border', 'Close']).toContain(line.type)
    }
  })

  it('traces contour lines for a single break', () => {
    const data = makeGradientGrid()
    const contour = new Contour(data, xs, ys, undefData)
    const lines = contour.tracingContourLines([20])

    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line.value).toBe(20)
    }
  })

  it('produces no contour lines when all data is undefined', () => {
    const data: number[][] = []
    for (let i = 0; i < 5; i++) {
      data[i] = []
      for (let j = 0; j < 5; j++) {
        data[i][j] = undefData
      }
    }
    const contour = new Contour(data, xs, ys, undefData)
    const lines = contour.tracingContourLines([10, 20, 30])
    expect(lines).toHaveLength(0)
  })

  it('traces polygons from contour lines', () => {
    const data = makeGradientGrid()
    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)

    expect(polygons.length).toBeGreaterThan(0)

    // Every polygon should have an outLine with points
    for (const poly of polygons) {
      expect(poly.outLine.pointList.length).toBeGreaterThan(0)
    }

    // At least one border polygon should exist
    const borderCount = polygons.filter((p) => p.isBorder).length
    expect(borderCount).toBeGreaterThan(0)
  })

  it('handles a grid with some undefined values', () => {
    // 5×5 grid with a gradient, but top-right corner is undefined
    const data = makeGradientGrid()
    data[3][4] = undefData
    data[4][4] = undefData

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30]
    const lines = contour.tracingContourLines(breaks)

    // Should still produce some contour lines
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('produces deterministic output for the same input', () => {
    const data1 = makeGradientGrid()
    const contour1 = new Contour(data1, xs, ys, undefData)
    const lines1 = contour1.tracingContourLines([10, 20, 30])

    const data2 = makeGradientGrid()
    const contour2 = new Contour(data2, xs, ys, undefData)
    const lines2 = contour2.tracingContourLines([10, 20, 30])

    expect(lines1.length).toBe(lines2.length)
    for (let i = 0; i < lines1.length; i++) {
      expect(lines1[i].value).toBe(lines2[i].value)
      expect(lines1[i].type).toBe(lines2[i].type)
      expect(lines1[i].pointList.length).toBe(lines2[i].pointList.length)
      for (let j = 0; j < lines1[i].pointList.length; j++) {
        expect(lines1[i].pointList[j].x).toBeCloseTo(lines2[i].pointList[j].x, 10)
        expect(lines1[i].pointList[j].y).toBeCloseTo(lines2[i].pointList[j].y, 10)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Contour — 2D peak grid (values increase toward center)
// ---------------------------------------------------------------------------

describe('Contour — 2D peak grid', () => {
  // 7×7 grid with a peak at center (3,3), value = 50
  // Values decrease linearly with distance from center
  const size = 7
  const undefData = 999999

  function makePeakGrid(): number[][] {
    const grid: number[][] = []
    const center = 3
    for (let i = 0; i < size; i++) {
      grid[i] = []
      for (let j = 0; j < size; j++) {
        const dist = Math.max(Math.abs(i - center), Math.abs(j - center))
        grid[i][j] = 50 - dist * 10
      }
    }
    return grid
  }

  it('traces closed contour lines around a peak', () => {
    const data = makePeakGrid()
    const xs = Array.from({ length: size }, (_, i) => i)
    const ys = Array.from({ length: size }, (_, i) => i)
    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30, 40]
    const lines = contour.tracingContourLines(breaks)

    expect(lines.length).toBeGreaterThan(0)

    // Should have at least some Close-type contour lines (concentric rings around peak)
    const closeLines = lines.filter((l) => l.type === 'Close')
    expect(closeLines.length).toBeGreaterThan(0)

    // All lines should have at least 2 points
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('traces polygons with high/low center detection', () => {
    const data = makePeakGrid()
    const xs = Array.from({ length: size }, (_, i) => i)
    const ys = Array.from({ length: size }, (_, i) => i)
    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30, 40]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)

    expect(polygons.length).toBeGreaterThan(0)

    // Should have both border and non-border (closed) polygons
    const closedPolygons = polygons.filter((p) => !p.isBorder)
    expect(closedPolygons.length).toBeGreaterThan(0)

    // Closed polygons around a peak should be high-center
    const highCenterCount = polygons.filter((p) => p.isHighCenter).length
    expect(highCenterCount).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Contour.tracingStreamline — smoke test
// ---------------------------------------------------------------------------

describe('Contour.tracingStreamline', () => {
  it('traces streamlines for a uniform eastward flow', () => {
    // 10×10 grid, uniform U=1, V=0 (eastward flow)
    const xNum = 10
    const yNum = 10
    const xs = Array.from({ length: xNum }, (_, i) => i)
    const ys = Array.from({ length: yNum }, (_, i) => i)
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < yNum; i++) {
      U[i] = []
      V[i] = []
      for (let j = 0; j < xNum; j++) {
        U[i][j] = 1
        V[i][j] = 0
      }
    }
    const undefData = 999999

    const data: number[][] = []
    for (let i = 0; i < yNum; i++) {
      data[i] = []
      for (let j = 0; j < xNum; j++) {
        data[i][j] = 0
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const streamlines = contour.tracingStreamline(U, V, xs, ys, undefData, 1)

    // Should produce at least some streamlines
    expect(streamlines.length).toBeGreaterThan(0)

    // Each streamline should have at least 2 points
    for (const line of streamlines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }

    // For uniform eastward flow, all y-coordinates within a streamline
    // should be approximately constant (horizontal lines)
    for (const line of streamlines) {
      const ys = line.pointList.map((p) => p.y)
      const yMin = Math.min(...ys)
      const yMax = Math.max(...ys)
      // Allow small numerical drift
      expect(yMax - yMin).toBeLessThan(1.0)
    }
  })

  it('returns array (possibly empty) for a grid with all undefined flow', () => {
    const xNum = 5
    const yNum = 5
    const xs = Array.from({ length: xNum }, (_, i) => i)
    const ys = Array.from({ length: yNum }, (_, i) => i)
    const undefData = 999999
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < yNum; i++) {
      U[i] = []
      V[i] = []
      for (let j = 0; j < xNum; j++) {
        U[i][j] = undefData
        V[i][j] = undefData
      }
    }

    const data: number[][] = []
    for (let i = 0; i < yNum; i++) {
      data[i] = []
      for (let j = 0; j < xNum; j++) {
        data[i][j] = 0
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const streamlines = contour.tracingStreamline(U, V, xs, ys, undefData, 1)

    // Should return an array without crashing
    expect(Array.isArray(streamlines)).toBe(true)
  })

  it('handles a rotational flow field', () => {
    // 10×10 grid with a rotational flow around center (5,5)
    const xNum = 10
    const yNum = 10
    const xs = Array.from({ length: xNum }, (_, i) => i)
    const ys = Array.from({ length: yNum }, (_, i) => i)
    const cx = 5
    const cy = 5
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < yNum; i++) {
      U[i] = []
      V[i] = []
      for (let j = 0; j < xNum; j++) {
        // Tangential flow: U = -(y - cy), V = (x - cx)
        U[i][j] = -(i - cy)
        V[i][j] = j - cx
      }
    }
    const undefData = 999999

    const data: number[][] = []
    for (let i = 0; i < yNum; i++) {
      data[i] = []
      for (let j = 0; j < xNum; j++) {
        data[i][j] = 0
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const streamlines = contour.tracingStreamline(U, V, xs, ys, undefData, 1)

    // Should produce streamlines without crashing
    expect(streamlines.length).toBeGreaterThan(0)
    for (const line of streamlines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }
  })
})

// ---------------------------------------------------------------------------
// Contour — valley grid (values decrease toward center)
// ---------------------------------------------------------------------------

describe('Contour — 2D valley grid', () => {
  // 7×7 grid with a valley at center (3,3), value = 0
  // Values increase linearly with distance from center
  const size = 7
  const undefData = 999999

  function makeValleyGrid(): number[][] {
    const grid: number[][] = []
    const center = 3
    for (let i = 0; i < size; i++) {
      grid[i] = []
      for (let j = 0; j < size; j++) {
        const dist = Math.max(Math.abs(i - center), Math.abs(j - center))
        grid[i][j] = dist * 10
      }
    }
    return grid
  }

  it('traces closed contour lines around a valley', () => {
    const data = makeValleyGrid()
    const xs = Array.from({ length: size }, (_, i) => i)
    const ys = Array.from({ length: size }, (_, i) => i)
    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30, 40]
    const lines = contour.tracingContourLines(breaks)

    expect(lines.length).toBeGreaterThan(0)

    // Should have at least some Close-type contour lines (concentric rings around valley)
    const closeLines = lines.filter((l) => l.type === 'Close')
    expect(closeLines.length).toBeGreaterThan(0)

    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('traces polygons with low-center detection', () => {
    const data = makeValleyGrid()
    const xs = Array.from({ length: size }, (_, i) => i)
    const ys = Array.from({ length: size }, (_, i) => i)
    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30, 40]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)

    expect(polygons.length).toBeGreaterThan(0)

    // Should have non-border (closed) polygons
    const closedPolygons = polygons.filter((p) => !p.isBorder)
    expect(closedPolygons.length).toBeGreaterThan(0)

    // Closed polygons around a valley should be low-center
    const lowCenterCount = polygons.filter((p) => !p.isHighCenter).length
    expect(lowCenterCount).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Contour — grid with all same values
// ---------------------------------------------------------------------------

describe('Contour — uniform grid', () => {
  it('produces no contour lines when all values are the same', () => {
    const xs = [0, 10, 20, 30, 40]
    const ys = [0, 1, 2, 3, 4]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 5; i++) {
      data[i] = []
      for (let j = 0; j < 5; j++) {
        data[i][j] = 50
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const lines = contour.tracingContourLines([10, 20, 30])
    // No contour lines because no value crosses any break
    expect(lines).toHaveLength(0)
  })

  it('produces a single border polygon when all values are above the max break', () => {
    const xs = [0, 10, 20, 30, 40]
    const ys = [0, 1, 2, 3, 4]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 5; i++) {
      data[i] = []
      for (let j = 0; j < 5; j++) {
        data[i][j] = 100
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const lines = contour.tracingContourLines([10, 20, 30])
    const polygons = contour.tracingPolygons(lines, [10, 20, 30])

    // Should produce at least one border polygon
    expect(polygons.length).toBeGreaterThan(0)
    const borderPolygons = polygons.filter((p) => p.isBorder)
    expect(borderPolygons.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Contour — vertical gradient
// ---------------------------------------------------------------------------

describe('Contour — vertical gradient grid', () => {
  it('traces contour lines for a vertical gradient', () => {
    const xs = [0, 1, 2, 3, 4]
    const ys = [0, 10, 20, 30, 40]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 5; i++) {
      data[i] = []
      for (let j = 0; j < 5; j++) {
        data[i][j] = i * 10 // 0, 10, 20, 30, 40
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30]
    const lines = contour.tracingContourLines(breaks)

    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }

    // Should have lines for each break value
    const values = new Set(lines.map((l) => l.value))
    for (const b of breaks) {
      expect(values.has(b)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Contour — diagonal gradient
// ---------------------------------------------------------------------------

describe('Contour — diagonal gradient grid', () => {
  it('traces contour lines for a diagonal gradient', () => {
    const size = 7
    const xs = Array.from({ length: size }, (_, i) => i)
    const ys = Array.from({ length: size }, (_, i) => i)
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < size; i++) {
      data[i] = []
      for (let j = 0; j < size; j++) {
        data[i][j] = (i + j) * 5
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30, 40, 50]
    const lines = contour.tracingContourLines(breaks)

    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }

    // Tracing polygons should work without crashing
    const polygons = contour.tracingPolygons(lines, breaks)
    expect(polygons.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Contour — small grid (3×3) edge case
// ---------------------------------------------------------------------------

describe('Contour — minimal 3×3 grid', () => {
  it('handles a minimal 3×3 grid with a peak', () => {
    const xs = [0, 1, 2]
    const ys = [0, 1, 2]
    const undefData = 999999
    const data = [[0, 0, 0], [0, 50, 0], [0, 0, 0]]

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30]
    const lines = contour.tracingContourLines(breaks)

    // Should produce some contour lines or none (but not crash)
    expect(Array.isArray(lines)).toBe(true)
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }
  })
})

// ---------------------------------------------------------------------------
// Contour — undefined data on borders
// ---------------------------------------------------------------------------

describe('Contour — undefined data on borders', () => {
  it('handles undefined data on top and bottom rows', () => {
    const xs = [0, 10, 20, 30, 40]
    const ys = [0, 1, 2, 3, 4]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 5; i++) {
      data[i] = []
      for (let j = 0; j < 5; j++) {
        if (i === 0 || i === 4) {
          data[i][j] = undefData
        } else {
          data[i][j] = j * 10
        }
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30]
    const lines = contour.tracingContourLines(breaks)

    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('handles undefined data on left and right columns', () => {
    const xs = [0, 10, 20, 30, 40]
    const ys = [0, 1, 2, 3, 4]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 5; i++) {
      data[i] = []
      for (let j = 0; j < 5; j++) {
        if (j === 0 || j === 4) {
          data[i][j] = undefData
        } else {
          data[i][j] = i * 10
        }
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30]
    const lines = contour.tracingContourLines(breaks)

    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }
  })
})

// ---------------------------------------------------------------------------
// Contour — no undefData parameter
// ---------------------------------------------------------------------------

describe('Contour — without undefData parameter', () => {
  it('works without specifying undefData', () => {
    const xs = [0, 10, 20, 30, 40]
    const ys = [0, 1, 2, 3, 4]
    const data: number[][] = []
    for (let i = 0; i < 5; i++) {
      data[i] = []
      for (let j = 0; j < 5; j++) {
        data[i][j] = j * 10
      }
    }

    // undefined undefData -> all data is considered defined
    const contour = new Contour(data, xs, ys)
    const breaks = [10, 20, 30]
    const lines = contour.tracingContourLines(breaks)

    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line.pointList.length).toBeGreaterThanOrEqual(2)
    }
  })
})
