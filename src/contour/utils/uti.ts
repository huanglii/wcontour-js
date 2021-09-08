import Extent from '../global/Extent'
import Line from '../global/Line'
import PointD from '../global/PointD'

export function doubleEquals(a: number, b: number): boolean {
  let difference = Math.abs(a * 0.00001)
  return Math.abs(a - b) <= difference
}

export function getExtent(pList: PointD[]): Extent {
  let minX: number, minY: number, maxX: number, maxY: number
  let i: number
  let aPoint: PointD = pList[0]
  minX = aPoint.x
  maxX = aPoint.x
  minY = aPoint.y
  maxY = aPoint.y
  for (i = 1; i < pList.length; i++) {
    aPoint = pList[i]
    if (aPoint.x < minX) {
      minX = aPoint.x
    }

    if (aPoint.x > maxX) {
      maxX = aPoint.x
    }

    if (aPoint.y < minY) {
      minY = aPoint.y
    }

    if (aPoint.y > maxY) {
      maxY = aPoint.y
    }
  }

  let aExtent = new Extent()
  aExtent.xMin = minX
  aExtent.yMin = minY
  aExtent.xMax = maxX
  aExtent.yMax = maxY

  return aExtent
}

export function getExtentAndArea(pList: PointD[], aExtent: Extent): number {
  let bArea: number, minX: number, minY: number, maxX: number, maxY: number
  let i: number
  let aPoint: PointD = pList[0]
  minX = aPoint.x
  maxX = aPoint.x
  minY = aPoint.y
  maxY = aPoint.y
  for (i = 1; i < pList.length; i++) {
    aPoint = pList[i]
    if (aPoint.x < minX) {
      minX = aPoint.x
    }

    if (aPoint.x > maxX) {
      maxX = aPoint.x
    }

    if (aPoint.y < minY) {
      minY = aPoint.y
    }

    if (aPoint.y > maxY) {
      maxY = aPoint.y
    }
  }

  aExtent.xMin = minX
  aExtent.yMin = minY
  aExtent.xMax = maxX
  aExtent.yMax = maxY
  bArea = (maxX - minX) * (maxY - minY)
  return bArea
}

export function isLineSegmentCross(lineA: Line, lineB: Line): boolean {
  let boundA = new Extent(),
    boundB = new Extent()
  let PListA: PointD[] = [],
    PListB: PointD[] = []
  PListA.push(lineA.P1)
  PListA.push(lineA.P2)
  PListB.push(lineB.P1)
  PListB.push(lineB.P2)
  getExtentAndArea(PListA, boundA)
  getExtentAndArea(PListB, boundB)

  if (!isExtentCross(boundA, boundB)) {
    return false
  } else {
    let XP1 =
      (lineB.P1.x - lineA.P1.x) * (lineA.P2.y - lineA.P1.y) -
      (lineA.P2.x - lineA.P1.x) * (lineB.P1.y - lineA.P1.y)
    let XP2 =
      (lineB.P2.x - lineA.P1.x) * (lineA.P2.y - lineA.P1.y) -
      (lineA.P2.x - lineA.P1.x) * (lineB.P2.y - lineA.P1.y)
    if (XP1 * XP2 > 0) {
      return false
    } else {
      return true
    }
  }
}

export function isExtentCross(aBound: Extent, bBound: Extent): boolean {
  if (
    aBound.xMin > bBound.xMax ||
    aBound.xMax < bBound.xMin ||
    aBound.yMin > bBound.yMax ||
    aBound.yMax < bBound.yMin
  ) {
    return false
  } else {
    return true
  }
}

/**
 * Determine if the point list is clockwise
 *
 * @param pointList point list
 * @return is or not clockwise
 */
export function isClockwise(pointList: PointD[]): boolean {
  let i: number
  let aPoint: PointD
  let yMax = 0
  let yMaxIdx = 0
  for (i = 0; i < pointList.length - 1; i++) {
    aPoint = pointList[i]
    if (i === 0) {
      yMax = aPoint.y
      yMaxIdx = 0
    } else if (yMax < aPoint.y) {
      yMax = aPoint.y
      yMaxIdx = i
    }
  }
  let p1: PointD, p2: PointD, p3: PointD
  let p1Idx: number, p2Idx: number, p3Idx: number
  p1Idx = yMaxIdx - 1
  p2Idx = yMaxIdx
  p3Idx = yMaxIdx + 1
  if (yMaxIdx === 0) {
    p1Idx = pointList.length - 2
  }

  p1 = pointList[p1Idx]
  p2 = pointList[p2Idx]
  p3 = pointList[p3Idx]
  if ((p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y) > 0) {
    return true
  } else {
    return false
  }
}

/**
 * Judge if a point is in a polygon
 *
 * @param poly polygon border
 * @param aPoint point
 * @return if the point is in the polygon
 */
export function pointInPolygonByPList(poly: PointD[], aPoint: PointD): boolean {
  let xNew: number, yNew: number, xOld: number, yOld: number
  let x1: number, y1: number, x2: number, y2: number
  let i: number
  let inside: boolean = false
  let nPoints: number = poly.length

  if (nPoints < 3) {
    return false
  }

  xOld = poly[nPoints - 1].x
  yOld = poly[nPoints - 1].y
  for (i = 0; i < nPoints; i++) {
    xNew = poly[i].x
    yNew = poly[i].y
    if (xNew > xOld) {
      x1 = xOld
      x2 = xNew
      y1 = yOld
      y2 = yNew
    } else {
      x1 = xNew
      x2 = xOld
      y1 = yNew
      y2 = yOld
    }

    //---- edge "open" at left end
    if (
      xNew < aPoint.x === aPoint.x <= xOld &&
      (aPoint.y - y1) * (x2 - x1) < (y2 - y1) * (aPoint.x - x1)
    ) {
      inside = !inside
    }

    xOld = xNew
    yOld = yNew
  }

  return inside
}
