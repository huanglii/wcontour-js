import { describe, it, expect } from 'vitest'
import { Contour, isobands } from '../src/index'

// ---------------------------------------------------------------------------
// Regression — nested border lines (a valid data ring with an undefined hole).
//
// This forces _tracingBorders into the "multiple border lines" branch where an
// inner border line must be detected as lying inside an outer border line and
// merged into the same Border as a hole. A previous bug compared the outer line
// to itself (borderLines[i] instead of borderLines[j]), so the hole was never
// merged. Isolines were unaffected, but isobands (filled polygons) came out
// wrong — exactly the QGIS rendering artifacts that motivated this test.
// ---------------------------------------------------------------------------

describe('Contour — donut grid with interior hole (nested borders)', () => {
  const m = 11
  const n = 11
  const xs = Array.from({ length: n }, (_, i) => i)
  const ys = Array.from({ length: m }, (_, i) => i)
  const undef = 999999

  function makeDonutGrid(): number[][] {
    const data: number[][] = []
    for (let i = 0; i < m; i++) {
      data[i] = []
      for (let j = 0; j < n; j++) {
        const di = i - 5
        const dj = j - 5
        const inHole = i >= 4 && i <= 6 && j >= 4 && j <= 6
        data[i][j] = inHole ? undef : 20 - Math.max(Math.abs(di), Math.abs(dj)) * 3
      }
    }
    return data
  }

  it('merges the inner hole line into a single border with two lines', () => {
    const contour = new Contour(makeDonutGrid(), xs, ys, undef) as unknown as {
      _borders: { getLineNum(): number }[]
    }
    // Outer ring + inner hole must be grouped into ONE border with two lines.
    // The bug produced two separate single-line borders instead.
    expect(contour._borders.length).toBe(1)
    expect(contour._borders[0].getLineNum()).toBe(2)
  })

  it('produces filled polygons that carry the interior hole', () => {
    const contour = new Contour(makeDonutGrid(), xs, ys, undef)
    const breaks = [5, 10, 15]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)
    const fc = isobands(polygons, breaks)

    expect(fc.features.length).toBeGreaterThan(0)

    // At least one filled polygon must have an interior ring (the hole).
    const withHole = fc.features.filter((f) => f.geometry.coordinates.length > 1)
    expect(withHole.length).toBeGreaterThan(0)
  })
})
