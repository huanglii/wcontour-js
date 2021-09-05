import Extent from './global/Extent'
import PointD from './global/PointD'
import PolyLine from './global/PolyLine'

export function traceBorder(
  s1: number[][],
  i1: number,
  i2: number,
  j1: number,
  j2: number,
  ij3: number[]
): boolean {
  let canTrace = true
  let a: number, b: number, c: number, d: number
  if (i1 < i2) {
    //---- Trace from bottom
    if (s1[i2][j2 - 1] === 1 && s1[i2][j2 + 1] === 1) {
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 + 1][j2]
      c = s1[i2 + 1][j2 - 1]
      if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
        ij3[0] = i2
        ij3[1] = j2 - 1
      } else {
        ij3[0] = i2
        ij3[1] = j2 + 1
      }
    } else if (s1[i2][j2 - 1] === 1 && s1[i2 + 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1]
      b = s1[i2 + 1][j2 + 1]
      c = s1[i2][j2 - 1]
      d = s1[i2][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2
          ij3[1] = j2 - 1
        } else {
          ij3[0] = i2 + 1
          ij3[1] = j2
        }
      } else {
        ij3[0] = i2
        ij3[1] = j2 - 1
      }
    } else if (s1[i2][j2 + 1] === 1 && s1[i2 + 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1]
      b = s1[i2 + 1][j2 + 1]
      c = s1[i2][j2 - 1]
      d = s1[i2][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2
          ij3[1] = j2 + 1
        } else {
          ij3[0] = i2 + 1
          ij3[1] = j2
        }
      } else {
        ij3[0] = i2
        ij3[1] = j2 + 1
      }
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 - 1
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 + 1
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1
      ij3[1] = j2
    } else {
      canTrace = false
    }
  } else if (j1 < j2) {
    //---- Trace from left
    if (s1[i2 + 1][j2] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1]
      b = s1[i2][j2 + 1]
      c = s1[i2 + 1][j2 + 1]
      if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
        ij3[0] = i2 + 1
        ij3[1] = j2
      } else {
        ij3[0] = i2 - 1
        ij3[1] = j2
      }
    } else if (s1[i2 + 1][j2] === 1 && s1[i2][j2 + 1] === 1) {
      c = s1[i2 - 1][j2]
      d = s1[i2 + 1][j2]
      a = s1[i2 - 1][j2 + 1]
      b = s1[i2 + 1][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2 + 1
          ij3[1] = j2
        } else {
          ij3[0] = i2
          ij3[1] = j2 + 1
        }
      } else {
        ij3[0] = i2 + 1
        ij3[1] = j2
      }
    } else if (s1[i2 - 1][j2] === 1 && s1[i2][j2 + 1] === 1) {
      c = s1[i2 - 1][j2]
      d = s1[i2 + 1][j2]
      a = s1[i2 - 1][j2 + 1]
      b = s1[i2 + 1][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2 - 1
          ij3[1] = j2
        } else {
          ij3[0] = i2
          ij3[1] = j2 + 1
        }
      } else {
        ij3[0] = i2 - 1
        ij3[1] = j2
      }
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1
      ij3[1] = j2
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1
      ij3[1] = j2
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 + 1
    } else {
      canTrace = false
    }
  } else if (i1 > i2) {
    //---- Trace from top
    if (s1[i2][j2 - 1] === 1 && s1[i2][j2 + 1] === 1) {
      a = s1[i2 + 1][j2 - 1]
      b = s1[i2 - 1][j2]
      c = s1[i2 - 1][j2 + 1]
      if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
        ij3[0] = i2
        ij3[1] = j2 - 1
      } else {
        ij3[0] = i2
        ij3[1] = j2 + 1
      }
    } else if (s1[i2][j2 - 1] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 - 1][j2 + 1]
      c = s1[i2][j2 - 1]
      d = s1[i2][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2
          ij3[1] = j2 - 1
        } else {
          ij3[0] = i2 - 1
          ij3[1] = j2
        }
      } else {
        ij3[0] = i2
        ij3[1] = j2 - 1
      }
    } else if (s1[i2][j2 + 1] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 - 1][j2 + 1]
      c = s1[i2][j2 - 1]
      d = s1[i2][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2
          ij3[1] = j2 + 1
        } else {
          ij3[0] = i2 - 1
          ij3[1] = j2
        }
      } else {
        ij3[0] = i2
        ij3[1] = j2 + 1
      }
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 - 1
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 + 1
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1
      ij3[1] = j2
    } else {
      canTrace = false
    }
  } else if (j1 > j2) {
    //---- Trace from right
    if (s1[i2 + 1][j2] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 + 1][j2 + 1]
      b = s1[i2][j2 - 1]
      c = s1[i2 - 1][j2 - 1]
      if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
        ij3[0] = i2 + 1
        ij3[1] = j2
      } else {
        ij3[0] = i2 - 1
        ij3[1] = j2
      }
    } else if (s1[i2 + 1][j2] === 1 && s1[i2][j2 - 1] === 1) {
      c = s1[i2 - 1][j2]
      d = s1[i2 + 1][j2]
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 + 1][j2 - 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2 + 1
          ij3[1] = j2
        } else {
          ij3[0] = i2
          ij3[1] = j2 - 1
        }
      } else {
        ij3[0] = i2 + 1
        ij3[1] = j2
      }
    } else if (s1[i2 - 1][j2] === 1 && s1[i2][j2 - 1] === 1) {
      c = s1[i2 - 1][j2]
      d = s1[i2 + 1][j2]
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 + 1][j2 - 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2 - 1
          ij3[1] = j2
        } else {
          ij3[0] = i2
          ij3[1] = j2 - 1
        }
      } else {
        ij3[0] = i2 - 1
        ij3[1] = j2
      }
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1
      ij3[1] = j2
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1
      ij3[1] = j2
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 - 1
    } else {
      canTrace = false
    }
  }
  return canTrace
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

export function doubleEquals(a: number, b: number): boolean {
  let difference = Math.abs(a * 0.00001)
  return Math.abs(a - b) <= difference
}
