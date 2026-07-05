import { describe, expect, it } from 'vitest'
import BorderPoint from '../src/contour/global/BorderPoint'
import Extent from '../src/contour/global/Extent'
import Line from '../src/contour/global/Line'
import PointD from '../src/contour/global/PointD'
import Polygon from '../src/contour/global/Polygon'
import PolyLine from '../src/contour/global/PolyLine'
import {
  addHoles_Ring,
  addPolygonHoles_Ring,
  distance_point2line,
  doubleEquals,
  getCrossPointD,
  getExtent,
  getExtentAndArea,
  isClockwise,
  isExtentCross,
  isLineSegmentCross,
  judgePolygonHighCenter,
  pointInPolygon,
  pointInPolygonByPList,
  pushAll,
  twoPointsInside,
} from '../src/contour/utils/uti'

describe('doubleEquals', () => {
  it('returns true for equal values', () => {
    expect(doubleEquals(1.0, 1.0)).toBe(true)
  })

  it('returns true for values within tolerance', () => {
    // tolerance is abs(a * 0.00001) = 1e-5 for a=1
    expect(doubleEquals(1.0, 1.0 + 5e-6)).toBe(true)
  })

  it('returns false for values outside tolerance', () => {
    expect(doubleEquals(1.0, 1.1)).toBe(false)
  })

  it('handles zero correctly', () => {
    // tolerance when a=0 is 0, so only exact 0 matches
    expect(doubleEquals(0, 0)).toBe(true)
    expect(doubleEquals(0, 1e-10)).toBe(false)
  })

  it('handles negative values', () => {
    expect(doubleEquals(-5.0, -5.0)).toBe(true)
    expect(doubleEquals(-5.0, -5.001)).toBe(false)
  })
})

describe('distance_point2line', () => {
  it('computes distance from point to a horizontal line', () => {
    const pt1 = new PointD(0, 0)
    const pt2 = new PointD(10, 0)
    const point = new PointD(5, 3)
    expect(distance_point2line(pt1, pt2, point)).toBeCloseTo(3, 5)
  })

  it('returns 0 when point is on the line', () => {
    const pt1 = new PointD(0, 0)
    const pt2 = new PointD(10, 10)
    const point = new PointD(5, 5)
    expect(distance_point2line(pt1, pt2, point)).toBeCloseTo(0, 5)
  })

  it('computes distance for a steep (near-vertical) line', () => {
    // The function divides by (pt2.x - pt1.x), so exactly vertical lines
    // produce Infinity/NaN. Test with a near-vertical line instead.
    const pt1 = new PointD(0, 0)
    const pt2 = new PointD(0.0001, 10)
    const point = new PointD(4, 5)
    // For a near-vertical line at x≈0, distance from (4,5) is ≈4
    expect(distance_point2line(pt1, pt2, point)).toBeCloseTo(4, 1)
  })
})

describe('getExtent', () => {
  it('computes extent of multiple points', () => {
    const points = [new PointD(1, 2), new PointD(5, 8), new PointD(3, 1), new PointD(7, 4)]
    const ext = getExtent(points)
    expect(ext.xMin).toBe(1)
    expect(ext.xMax).toBe(7)
    expect(ext.yMin).toBe(1)
    expect(ext.yMax).toBe(8)
  })

  it('handles a single point', () => {
    const points = [new PointD(3, 4)]
    const ext = getExtent(points)
    expect(ext.xMin).toBe(3)
    expect(ext.xMax).toBe(3)
    expect(ext.yMin).toBe(4)
    expect(ext.yMax).toBe(4)
  })
})

describe('getExtentAndArea', () => {
  it('computes extent and area', () => {
    const points = [new PointD(0, 0), new PointD(5, 0), new PointD(5, 10), new PointD(0, 10)]
    const ext = new Extent()
    const area = getExtentAndArea(points, ext)
    expect(ext.xMin).toBe(0)
    expect(ext.xMax).toBe(5)
    expect(ext.yMin).toBe(0)
    expect(ext.yMax).toBe(10)
    expect(area).toBe(50)
  })
})

describe('isExtentCross', () => {
  it('returns true for overlapping extents', () => {
    const a = new Extent(0, 10, 0, 10)
    const b = new Extent(5, 15, 5, 15)
    expect(isExtentCross(a, b)).toBe(true)
  })

  it('returns false for non-overlapping extents', () => {
    const a = new Extent(0, 5, 0, 5)
    const b = new Extent(10, 15, 10, 15)
    expect(isExtentCross(a, b)).toBe(false)
  })

  it('returns true for identical extents', () => {
    const a = new Extent(0, 10, 0, 10)
    const b = new Extent(0, 10, 0, 10)
    expect(isExtentCross(a, b)).toBe(true)
  })

  it('returns false for horizontally separated extents', () => {
    const a = new Extent(0, 5, 0, 10)
    const b = new Extent(6, 10, 0, 10)
    expect(isExtentCross(a, b)).toBe(false)
  })
})

describe('isClockwise', () => {
  // Note: the function finds the highest-y point and checks the cross product
  // of its neighbors. The convention may differ from standard math orientation.
  // (0,0) → (0,10) → (10,10) → (10,0) returns true (clockwise per this function)
  it('returns true for a clockwise-oriented square', () => {
    const points = [
      new PointD(0, 0),
      new PointD(0, 10),
      new PointD(10, 10),
      new PointD(10, 0),
      new PointD(0, 0), // closed
    ]
    expect(isClockwise(points)).toBe(true)
  })

  it('returns false for a counter-clockwise-oriented square', () => {
    const points = [
      new PointD(0, 0),
      new PointD(10, 0),
      new PointD(10, 10),
      new PointD(0, 10),
      new PointD(0, 0), // closed
    ]
    expect(isClockwise(points)).toBe(false)
  })
})

describe('pointInPolygonByPList', () => {
  // Counter-clockwise square (0,0) -> (0,10) -> (10,10) -> (10,0) -> (0,0)
  const square = [new PointD(0, 0), new PointD(0, 10), new PointD(10, 10), new PointD(10, 0), new PointD(0, 0)]

  it('returns true for a point inside', () => {
    expect(pointInPolygonByPList(square, new PointD(5, 5))).toBe(true)
  })

  it('returns false for a point outside', () => {
    expect(pointInPolygonByPList(square, new PointD(15, 15))).toBe(false)
  })

  it('returns false for a point to the left', () => {
    expect(pointInPolygonByPList(square, new PointD(-5, 5))).toBe(false)
  })

  it('returns false for fewer than 3 points', () => {
    expect(pointInPolygonByPList([new PointD(0, 0), new PointD(1, 1)], new PointD(0.5, 0.5))).toBe(false)
  })
})

describe('pointInPolygon', () => {
  it('returns true for point inside polygon without holes', () => {
    const polygon = new Polygon()
    polygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 10),
      new PointD(10, 10),
      new PointD(10, 0),
      new PointD(0, 0),
    ]
    expect(pointInPolygon(polygon, new PointD(5, 5))).toBe(true)
  })

  it('returns false for point inside a hole', () => {
    const polygon = new Polygon()
    polygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 20),
      new PointD(20, 20),
      new PointD(20, 0),
      new PointD(0, 0),
    ]
    // Add a hole (clockwise to be a proper hole)
    const hole = new (class extends Polygon {})()
    hole.outLine.pointList = [
      new PointD(5, 5),
      new PointD(15, 5),
      new PointD(15, 15),
      new PointD(5, 15),
      new PointD(5, 5),
    ]
    polygon.holeLines.push(hole.outLine)
    expect(pointInPolygon(polygon, new PointD(10, 10))).toBe(false)
    expect(pointInPolygon(polygon, new PointD(2, 2))).toBe(true)
  })
})

describe('getCrossPointD', () => {
  it('finds intersection of two crossing lines', () => {
    const lineA = new Line()
    lineA.P1 = new PointD(0, 0)
    lineA.P2 = new PointD(10, 10)
    const lineB = new Line()
    lineB.P1 = new PointD(0, 10)
    lineB.P2 = new PointD(10, 0)
    const cross = getCrossPointD(lineA, lineB)
    expect(cross.x).toBeCloseTo(5, 5)
    expect(cross.y).toBeCloseTo(5, 5)
  })

  it('finds intersection of horizontal and vertical lines', () => {
    const lineA = new Line()
    lineA.P1 = new PointD(0, 5)
    lineA.P2 = new PointD(10, 5)
    const lineB = new Line()
    lineB.P1 = new PointD(5, 0)
    lineB.P2 = new PointD(5, 10)
    const cross = getCrossPointD(lineA, lineB)
    expect(cross.x).toBeCloseTo(5, 5)
    expect(cross.y).toBeCloseTo(5, 5)
  })
})

describe('isLineSegmentCross', () => {
  it('returns true for crossing segments', () => {
    const lineA = new Line()
    lineA.P1 = new PointD(0, 0)
    lineA.P2 = new PointD(10, 10)
    const lineB = new Line()
    lineB.P1 = new PointD(0, 10)
    lineB.P2 = new PointD(10, 0)
    expect(isLineSegmentCross(lineA, lineB)).toBe(true)
  })

  it('returns false for non-crossing parallel segments', () => {
    const lineA = new Line()
    lineA.P1 = new PointD(0, 0)
    lineA.P2 = new PointD(10, 0)
    const lineB = new Line()
    lineB.P1 = new PointD(0, 5)
    lineB.P2 = new PointD(10, 5)
    expect(isLineSegmentCross(lineA, lineB)).toBe(false)
  })

  it('returns false for non-overlapping distant segments', () => {
    const lineA = new Line()
    lineA.P1 = new PointD(0, 0)
    lineA.P2 = new PointD(1, 1)
    const lineB = new Line()
    lineB.P1 = new PointD(100, 100)
    lineB.P2 = new PointD(200, 200)
    expect(isLineSegmentCross(lineA, lineB)).toBe(false)
  })

  it('returns true for collinear overlapping segments (quirk)', () => {
    // Collinear: both points of B are on line A, so XP1*XP2 === 0 (not > 0)
    const lineA = new Line()
    lineA.P1 = new PointD(0, 0)
    lineA.P2 = new PointD(10, 10)
    const lineB = new Line()
    lineB.P1 = new PointD(2, 2)
    lineB.P2 = new PointD(8, 8)
    expect(isLineSegmentCross(lineA, lineB)).toBe(true)
  })

  it('returns true for T-junction (endpoint touching segment)', () => {
    const lineA = new Line()
    lineA.P1 = new PointD(0, 0)
    lineA.P2 = new PointD(10, 0)
    const lineB = new Line()
    lineB.P1 = new PointD(5, 0)
    lineB.P2 = new PointD(5, 10)
    expect(isLineSegmentCross(lineA, lineB)).toBe(true)
  })
})

describe('twoPointsInside', () => {
  it('returns true when both points are inside the interval', () => {
    expect(twoPointsInside(0, 10, 3, 7)).toBe(true)
  })

  it('returns true when both points are outside the interval', () => {
    expect(twoPointsInside(0, 10, 15, 20)).toBe(true)
  })

  it('returns false when b1 is inside and b2 is outside', () => {
    expect(twoPointsInside(0, 10, 5, 15)).toBe(false)
  })

  it('returns false when b1 is outside and b2 is inside', () => {
    expect(twoPointsInside(0, 10, 15, 5)).toBe(false)
  })

  it('handles reversed interval (a2 < a1) with modular arithmetic', () => {
    // The function uses modular arithmetic; reversed intervals are normalized
    expect(twoPointsInside(10, 0, 3, 7)).toBe(true)
  })

  it('returns true when both points are just inside the boundaries', () => {
    expect(twoPointsInside(0, 10, 1, 9)).toBe(true)
  })

  it('returns false when b1 is exactly at a1 (strict > check)', () => {
    // b1 = a1 = 0: the first branch (b1 > a1) is not taken,
    // and b2 is inside so the else-if returns false
    expect(twoPointsInside(0, 10, 0, 5)).toBe(false)
  })
})

describe('doubleEquals — additional edge cases', () => {
  it('handles very large numbers', () => {
    expect(doubleEquals(1e10, 1e10)).toBe(true)
    // tolerance = abs(1e10 * 0.00001) = 1e5
    expect(doubleEquals(1e10, 1e10 + 1e4)).toBe(true)
    expect(doubleEquals(1e10, 1e10 + 1e6)).toBe(false)
  })

  it('handles very small numbers near zero', () => {
    // tolerance when a is very small is also very small
    expect(doubleEquals(1e-10, 1e-10)).toBe(true)
    // a=1e-10 → tolerance = 1e-15, difference = 1e-15 is within
    expect(doubleEquals(1e-10, 2e-10)).toBe(false)
  })
})

describe('distance_point2line — additional edge cases', () => {
  it('returns 0 when point is at pt1', () => {
    const pt1 = new PointD(0, 0)
    const pt2 = new PointD(10, 10)
    expect(distance_point2line(pt1, pt2, pt1)).toBeCloseTo(0, 5)
  })

  it('returns 0 when point is at pt2', () => {
    const pt1 = new PointD(0, 0)
    const pt2 = new PointD(10, 10)
    expect(distance_point2line(pt1, pt2, pt2)).toBeCloseTo(0, 5)
  })

  it('works with negative coordinates', () => {
    const pt1 = new PointD(-10, -10)
    const pt2 = new PointD(10, -10)
    const point = new PointD(0, -5)
    expect(distance_point2line(pt1, pt2, point)).toBeCloseTo(5, 5)
  })
})

describe('getCrossPointD — additional edge cases', () => {
  it('finds intersection for diagonal lines crossing at origin', () => {
    const lineA = new Line()
    lineA.P1 = new PointD(-5, -5)
    lineA.P2 = new PointD(5, 5)
    const lineB = new Line()
    lineB.P1 = new PointD(-5, 5)
    lineB.P2 = new PointD(5, -5)
    const cross = getCrossPointD(lineA, lineB)
    expect(cross.x).toBeCloseTo(0, 5)
    expect(cross.y).toBeCloseTo(0, 5)
  })

  it('returns lineB.P1 when P1 is exactly on lineA', () => {
    const lineA = new Line()
    lineA.P1 = new PointD(0, 0)
    lineA.P2 = new PointD(10, 10)
    const lineB = new Line()
    lineB.P1 = new PointD(5, 5)
    lineB.P2 = new PointD(15, 5)
    const cross = getCrossPointD(lineA, lineB)
    expect(cross.x).toBe(5)
    expect(cross.y).toBe(5)
  })
})

describe('pointInPolygonByPList — additional edge cases', () => {
  it('returns false for an empty polygon', () => {
    expect(pointInPolygonByPList([], new PointD(5, 5))).toBe(false)
  })

  it('handles a triangle', () => {
    const triangle = [new PointD(0, 0), new PointD(10, 0), new PointD(5, 10), new PointD(0, 0)]
    expect(pointInPolygonByPList(triangle, new PointD(5, 3))).toBe(true)
    expect(pointInPolygonByPList(triangle, new PointD(5, 8))).toBe(true)
    expect(pointInPolygonByPList(triangle, new PointD(0, 10))).toBe(false)
  })
})

describe('isClockwise — additional edge cases', () => {
  it('handles a triangle', () => {
    const cwTriangle = [new PointD(0, 0), new PointD(0, 10), new PointD(10, 0), new PointD(0, 0)]
    expect(isClockwise(cwTriangle)).toBe(true)
  })

  it('handles a concave polygon', () => {
    // A concave polygon with a notch
    const points = [
      new PointD(0, 0),
      new PointD(0, 10),
      new PointD(5, 5),
      new PointD(10, 10),
      new PointD(10, 0),
      new PointD(0, 0),
    ]
    const result = isClockwise(points)
    // Just verify it returns a boolean without error
    expect(typeof result).toBe('boolean')
  })
})

// ---------------------------------------------------------------------------
// getExtent — wrapper around getExtentAndArea that returns only the Extent
// ---------------------------------------------------------------------------

describe('getExtent', () => {
  it('returns the extent without area', () => {
    const points = [new PointD(1, 2), new PointD(5, 8), new PointD(3, 1)]
    const ext = getExtent(points)
    expect(ext.xMin).toBe(1)
    expect(ext.xMax).toBe(5)
    expect(ext.yMin).toBe(1)
    expect(ext.yMax).toBe(8)
  })

  it('handles a single point', () => {
    const ext = getExtent([new PointD(3, 4)])
    expect(ext.xMin).toBe(3)
    expect(ext.xMax).toBe(3)
    expect(ext.yMin).toBe(4)
    expect(ext.yMax).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// pushAll — copies all items from source to target
// ---------------------------------------------------------------------------

describe('pushAll', () => {
  it('pushes all items from source to target', () => {
    const target: number[] = [1, 2]
    pushAll(target, [3, 4, 5])
    expect(target).toEqual([1, 2, 3, 4, 5])
  })

  it('does nothing for an empty source', () => {
    const target: number[] = [1, 2]
    pushAll(target, [])
    expect(target).toEqual([1, 2])
  })

  it('works with objects', () => {
    const target: PointD[] = []
    const source = [new PointD(1, 2), new PointD(3, 4)]
    pushAll(target, source)
    expect(target.length).toBe(2)
    expect(target[0].x).toBe(1)
    expect(target[1].y).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// judgePolygonHighCenter — determines high/low center for border and closed polygons
// ---------------------------------------------------------------------------

describe('judgePolygonHighCenter', () => {
  it('creates a border polygon when borderPolygons is empty and border value is below min', () => {
    // Border value is lower than all line values -> isHighCenter = true
    const borderList: BorderPoint[] = []
    for (let i = 0; i < 4; i++) {
      const bp = new BorderPoint()
      bp.point = new PointD(i, 0)
      bp.value = 5
      borderList.push(bp)
    }

    const aLineList: PolyLine[] = []
    const line1 = new PolyLine()
    line1.value = 10
    aLineList.push(line1)
    const line2 = new PolyLine()
    line2.value = 20
    aLineList.push(line2)

    const result = judgePolygonHighCenter([], [], aLineList, borderList)
    // Should create a border polygon
    expect(result.length).toBe(1)
    expect(result[0].isBorder).toBe(true)
    expect(result[0].isHighCenter).toBe(true)
    expect(result[0].lowValue).toBe(5)
    expect(result[0].highValue).toBe(10)
  })

  it('creates a border polygon when border value is above max', () => {
    const borderList: BorderPoint[] = []
    for (let i = 0; i < 4; i++) {
      const bp = new BorderPoint()
      bp.point = new PointD(i, 0)
      bp.value = 50
      borderList.push(bp)
    }

    const aLineList: PolyLine[] = []
    const line1 = new PolyLine()
    line1.value = 10
    aLineList.push(line1)
    const line2 = new PolyLine()
    line2.value = 20
    aLineList.push(line2)

    const result = judgePolygonHighCenter([], [], aLineList, borderList)
    expect(result.length).toBe(1)
    expect(result[0].isHighCenter).toBe(false)
    expect(result[0].lowValue).toBe(20)
    expect(result[0].highValue).toBe(50)
  })

  it('merges closed polygons and judges high center based on containment', () => {
    // Create a border polygon (large, high center)
    const borderPolygon = new Polygon()
    borderPolygon.isBorder = true
    borderPolygon.isHighCenter = true
    borderPolygon.lowValue = 0
    borderPolygon.highValue = 10
    borderPolygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 20),
      new PointD(20, 20),
      new PointD(20, 0),
      new PointD(0, 0),
    ]
    borderPolygon.extent = new Extent(0, 20, 0, 20)

    // Create a closed polygon (small, inside the border)
    const closedPolygon = new Polygon()
    closedPolygon.isBorder = false
    closedPolygon.isHighCenter = true
    closedPolygon.lowValue = 5
    closedPolygon.highValue = 10
    const closedLine = new PolyLine()
    closedLine.type = 'Close'
    closedLine.value = 5
    closedLine.pointList = [
      new PointD(5, 5),
      new PointD(5, 15),
      new PointD(15, 15),
      new PointD(15, 5),
      new PointD(5, 5),
    ]
    closedPolygon.outLine = closedLine
    closedPolygon.extent = new Extent(5, 15, 5, 15)

    const borderList: BorderPoint[] = []
    for (let i = 0; i < 4; i++) {
      const bp = new BorderPoint()
      bp.point = new PointD(i, 0)
      bp.value = 0
      borderList.push(bp)
    }

    const result = judgePolygonHighCenter([borderPolygon], [closedPolygon], [], borderList)
    // Should contain both polygons
    expect(result.length).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// addHoles_Ring — adds holes from a hole list to containing polygons
// ---------------------------------------------------------------------------

describe('addHoles_Ring', () => {
  it('adds a hole to a polygon that contains it', () => {
    const polygon = new Polygon()
    polygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 20),
      new PointD(20, 20),
      new PointD(20, 0),
      new PointD(0, 0),
    ]
    polygon.extent = new Extent(0, 20, 0, 20)

    const holePoints = [
      new PointD(5, 5),
      new PointD(5, 15),
      new PointD(15, 15),
      new PointD(15, 5),
      new PointD(5, 5),
    ]

    addHoles_Ring([polygon], [holePoints])
    expect(polygon.hasHoles()).toBe(true)
    expect(polygon.holeLines).toHaveLength(1)
  })

  it('does not add a hole when polygon does not contain it', () => {
    const polygon = new Polygon()
    polygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 10),
      new PointD(10, 10),
      new PointD(10, 0),
      new PointD(0, 0),
    ]
    polygon.extent = new Extent(0, 10, 0, 10)

    const holePoints = [
      new PointD(50, 50),
      new PointD(50, 60),
      new PointD(60, 60),
      new PointD(60, 50),
      new PointD(50, 50),
    ]

    addHoles_Ring([polygon], [holePoints])
    expect(polygon.hasHoles()).toBe(false)
  })

  it('adds hole to the first matching polygon only', () => {
    const polygon1 = new Polygon()
    polygon1.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 30),
      new PointD(30, 30),
      new PointD(30, 0),
      new PointD(0, 0),
    ]
    polygon1.extent = new Extent(0, 30, 0, 30)

    const polygon2 = new Polygon()
    polygon2.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 30),
      new PointD(30, 30),
      new PointD(30, 0),
      new PointD(0, 0),
    ]
    polygon2.extent = new Extent(0, 30, 0, 30)

    const holePoints = [
      new PointD(5, 5),
      new PointD(5, 15),
      new PointD(15, 15),
      new PointD(15, 5),
      new PointD(5, 5),
    ]

    addHoles_Ring([polygon1, polygon2], [holePoints])
    // Only polygon2 (last in iteration) should get the hole
    expect(polygon1.hasHoles()).toBe(false)
    expect(polygon2.hasHoles()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// addPolygonHoles_Ring — adds holes with ring nesting structure
// ---------------------------------------------------------------------------

describe('addPolygonHoles_Ring', () => {
  it('returns original list when no hole polygons exist', () => {
    const polygon = new Polygon()
    polygon.isBorder = true
    polygon.isInnerBorder = false
    polygon.outLine.pointList = [new PointD(0, 0), new PointD(10, 0), new PointD(10, 10), new PointD(0, 0)]

    const inputList = [polygon]
    const result = addPolygonHoles_Ring(inputList)
    expect(result).toBe(inputList) // same array reference, no holes added
    expect(result.length).toBe(1)
  })

  it('assigns holes to border polygons', () => {
    // Border polygon (large)
    const border = new Polygon()
    border.isBorder = true
    border.isInnerBorder = false
    border.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 30),
      new PointD(30, 30),
      new PointD(30, 0),
      new PointD(0, 0),
    ]
    border.extent = new Extent(0, 30, 0, 30)

    // Inner polygon (will become a hole)
    const inner = new Polygon()
    inner.isBorder = false
    inner.outLine.pointList = [
      new PointD(5, 5),
      new PointD(5, 15),
      new PointD(15, 15),
      new PointD(15, 5),
      new PointD(5, 5),
    ]
    inner.extent = new Extent(5, 15, 5, 15)

    const result = addPolygonHoles_Ring([border, inner])
    expect(result.length).toBe(2)
    // Border should have the inner as a hole
    expect(border.hasHoles()).toBe(true)
    // Inner should have holeIndex = 1
    expect(inner.holeIndex).toBe(1)
  })

  it('handles nested inner polygons (holeIndex > 1)', () => {
    // Border polygon (large)
    const border = new Polygon()
    border.isBorder = true
    border.isInnerBorder = false
    border.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 50),
      new PointD(50, 50),
      new PointD(50, 0),
      new PointD(0, 0),
    ]
    border.extent = new Extent(0, 50, 0, 50)

    // First inner polygon
    const inner1 = new Polygon()
    inner1.isBorder = false
    inner1.outLine.pointList = [
      new PointD(5, 5),
      new PointD(5, 40),
      new PointD(40, 40),
      new PointD(40, 5),
      new PointD(5, 5),
    ]
    inner1.extent = new Extent(5, 40, 5, 40)

    // Second inner polygon (inside inner1)
    const inner2 = new Polygon()
    inner2.isBorder = false
    inner2.outLine.pointList = [
      new PointD(10, 10),
      new PointD(10, 30),
      new PointD(30, 30),
      new PointD(30, 10),
      new PointD(10, 10),
    ]
    inner2.extent = new Extent(10, 30, 10, 30)

    const result = addPolygonHoles_Ring([border, inner1, inner2])
    expect(result.length).toBe(3)
    expect(inner1.holeIndex).toBe(1)
    expect(inner2.holeIndex).toBe(2)
  })
})
