import BorderPoint from '../global/BorderPoint'
import Extent from '../global/Extent'
import Line from '../global/Line'
import PointD from '../global/PointD'
import Polygon from '../global/Polygon'
import PolyLine from '../global/PolyLine'

export function doubleEquals(a: number, b: number): boolean {
  let difference = Math.abs(a * 0.00001)
  return Math.abs(a - b) <= difference
}

export function distance_point2line(pt1: PointD, pt2: PointD, point: PointD): number {
  let k = (pt2.y - pt1.y) / (pt2.x - pt1.x)
  let x = (k * k * pt1.x + k * (point.y - pt1.y) + point.x) / (k * k + 1)
  let y = k * (x - pt1.x) + pt1.y
  let dis = Math.sqrt((point.y - y) * (point.y - y) + (point.x - x) * (point.x - x))
  return dis
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

export function getCrossPointD(lineA: Line, lineB: Line): PointD {
  let IPoint = new PointD()

  let XP1 =
    (lineB.P1.x - lineA.P1.x) * (lineA.P2.y - lineA.P1.y) -
    (lineA.P2.x - lineA.P1.x) * (lineB.P1.y - lineA.P1.y)
  let XP2 =
    (lineB.P2.x - lineA.P1.x) * (lineA.P2.y - lineA.P1.y) -
    (lineA.P2.x - lineA.P1.x) * (lineB.P2.y - lineA.P1.y)
  if (XP1 === 0) {
    IPoint = lineB.P1
  } else if (XP2 === 0) {
    IPoint = lineB.P2
  } else {
    const p1 = lineA.P1
    const p2 = lineA.P2
    const q1 = lineB.P1
    const q2 = lineB.P2

    let tempLeft = (q2.x - q1.x) * (p1.y - p2.y) - (p2.x - p1.x) * (q1.y - q2.y)
    let tempRight =
      (p1.y - q1.y) * (p2.x - p1.x) * (q2.x - q1.x) +
      q1.x * (q2.y - q1.y) * (p2.x - p1.x) -
      p1.x * (p2.y - p1.y) * (q2.x - q1.x)
    IPoint.x = tempRight / tempLeft

    tempLeft = (p1.x - p2.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q1.x - q2.x)
    tempRight =
      p2.y * (p1.x - p2.x) * (q2.y - q1.y) +
      (q2.x - p2.x) * (q2.y - q1.y) * (p1.y - p2.y) -
      q2.y * (q1.x - q2.x) * (p2.y - p1.y)
    IPoint.y = tempRight / tempLeft
  }
  return IPoint
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

export function twoPointsInside(a1: number, a2: number, b1: number, b2: number): boolean {
  if (a2 < a1) {
    a1 += 1
  }
  if (b1 < a1) {
    a1 += 1
  }
  if (b1 < a2) {
    a2 += 1
  }

  if (a2 < a1) {
    let c = a1
    a1 = a2
    a2 = c
  }

  if (b1 > a1 && b1 <= a2) {
    if (b2 > a1 && b2 <= a2) {
      return true
    } else {
      return false
    }
  } else if (!(b2 > a1 && b2 <= a2)) {
    return true
  } else {
    return false
  }
}

/**
 * Judge if a point is in a polygon
 *
 * @param aPolygon polygon
 * @param aPoint point
 * @return if the point is in the polygon
 */
export function pointInPolygon(aPolygon: Polygon, aPoint: PointD): boolean {
  if (aPolygon.hasHoles()) {
    let isIn: boolean = pointInPolygonByPList(aPolygon.outLine.pointList, aPoint)
    if (isIn) {
      for (let aLine of aPolygon.holeLines) {
        if (pointInPolygonByPList(aLine.pointList, aPoint)) {
          isIn = false
          break
        }
      }
    }
    return isIn
  } else {
    return pointInPolygonByPList(aPolygon.outLine.pointList, aPoint)
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
  let inside = false
  let nPoints = poly.length

  if (nPoints < 3) {
    return false
  }

  let xOld = poly[nPoints - 1].x
  let yOld = poly[nPoints - 1].y
  let x1: number, y1: number, x2: number, y2: number
  for (let i = 0; i < nPoints; i++) {
    const xNew = poly[i].x
    const yNew = poly[i].y
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

export function judgePolygonHighCenter(
  borderPolygons: Polygon[],
  closedPolygons: Polygon[],
  aLineList: PolyLine[],
  borderList: BorderPoint[]
): Polygon[] {
  let aPolygon: Polygon
  let aLine: PolyLine
  let newPList: PointD[] = []
  let aBound: Extent
  let aValue: number
  let bValue: number
  let aPoint: PointD

  if (borderPolygons.length === 0) {
    //Add border polygon
    //Get max & min values
    let max = aLineList[0].value,
      min = aLineList[0].value
    for (let aPLine of aLineList) {
      if (aPLine.value > max) {
        max = aPLine.value
      }
      if (aPLine.value < min) {
        min = aPLine.value
      }
    }
    aPolygon = new Polygon()
    aValue = borderList[0].value
    if (aValue < min) {
      max = min
      min = aValue
      aPolygon.isHighCenter = true
    } else if (aValue > max) {
      min = max
      max = aValue
      aPolygon.isHighCenter = false
    }
    aLine = new PolyLine()
    aLine.type = 'Border'
    aLine.value = aValue
    newPList = []
    for (let aP of borderList) {
      newPList.push(aP.point)
    }
    aLine.pointList = []
    aLine.pointList.push(...newPList)
    if (aLine.pointList.length > 0) {
      aPolygon.isBorder = true
      aPolygon.lowValue = min
      aPolygon.highValue = max
      aBound = new Extent()
      aPolygon.area = getExtentAndArea(aLine.pointList, aBound)
      aPolygon.isClockWise = isClockwise(aLine.pointList)
      aPolygon.extent = aBound
      aPolygon.outLine = aLine
      aPolygon.holeLines = []
      borderPolygons.push(aPolygon)
    }
  }

  //---- Add close polygons to form total polygons list
  borderPolygons.push(...closedPolygons)

  //---- Juge isHighCenter for close polygons
  let cBound1: Extent, cBound2: Extent
  let polygonNum = borderPolygons.length
  let bPolygon: Polygon
  for (let i = 1; i < polygonNum; i++) {
    aPolygon = borderPolygons[i]
    if (aPolygon.outLine.type === 'Close') {
      cBound1 = aPolygon.extent
      //aValue = aPolygon.lowValue;
      aPoint = aPolygon.outLine.pointList[0]
      for (let j = i - 1; j >= 0; j--) {
        bPolygon = borderPolygons[j]
        cBound2 = bPolygon.extent
        //bValue = bPolygon.lowValue;
        newPList = []
        newPList.push(...bPolygon.outLine.pointList)
        if (pointInPolygonByPList(newPList, aPoint)) {
          if (
            cBound1.xMin > cBound2.xMin &&
            cBound1.yMin > cBound2.yMin &&
            cBound1.xMax < cBound2.xMax &&
            cBound1.yMax < cBound2.yMax
          ) {
            if (bPolygon.isHighCenter) {
              aPolygon.isHighCenter = aPolygon.highValue !== bPolygon.lowValue
            } else {
              aPolygon.isHighCenter = aPolygon.lowValue === bPolygon.highValue
            }
            break
          }
        }
      }
    }
  }
  return borderPolygons
}

export function addHoles_Ring(polygonList: Polygon[], holeList: PointD[][]) {
  for (let i = 0; i < holeList.length; i++) {
    let holePs = holeList[i]
    let aExtent = getExtent(holePs)
    for (let j = polygonList.length - 1; j >= 0; j--) {
      let aPolygon = polygonList[j]
      if (aPolygon.extent.include(aExtent)) {
        let isHole = true
        for (let aP of holePs) {
          if (!pointInPolygonByPList(aPolygon.outLine.pointList, aP)) {
            isHole = false
            break
          }
        }
        if (isHole) {
          aPolygon.addHole(holePs)
          //polygonList[j] = aPolygon;
          break
        }
      }
    }
  }
}

export function addPolygonHoles_Ring(polygonList: Polygon[]): Polygon[] {
  let holePolygons: Polygon[] = []
  let i, j
  for (i = 0; i < polygonList.length; i++) {
    let aPolygon = polygonList[i]
    if (!aPolygon.isBorder || aPolygon.isInnerBorder) {
      aPolygon.holeIndex = 1
      holePolygons.push(aPolygon)
    }
  }

  if (holePolygons.length === 0) {
    return polygonList
  } else {
    let newPolygons: Polygon[] = []
    for (i = 1; i < holePolygons.length; i++) {
      let aPolygon = holePolygons[i]
      for (j = i - 1; j >= 0; j--) {
        let bPolygon = holePolygons[j]
        if (bPolygon.extent.include(aPolygon.extent)) {
          if (pointInPolygonByPList(bPolygon.outLine.pointList, aPolygon.outLine.pointList[0])) {
            aPolygon.holeIndex = bPolygon.holeIndex + 1
            bPolygon.addHole(aPolygon)
            //holePolygons[i] = aPolygon;
            //holePolygons[j] = bPolygon;
            break
          }
        }
      }
    }
    let hole1Polygons: Polygon[] = []
    for (i = 0; i < holePolygons.length; i++) {
      if (holePolygons[i].holeIndex === 1) {
        hole1Polygons.push(holePolygons[i])
      }
    }

    for (i = 0; i < polygonList.length; i++) {
      let aPolygon = polygonList[i]
      if (aPolygon.isBorder && !aPolygon.isInnerBorder) {
        for (j = 0; j < hole1Polygons.length; j++) {
          let bPolygon = hole1Polygons[j]
          if (aPolygon.extent.include(bPolygon.extent)) {
            if (pointInPolygonByPList(aPolygon.outLine.pointList, bPolygon.outLine.pointList[0])) {
              aPolygon.addHole(bPolygon)
            }
          }
        }
        newPolygons.push(aPolygon)
      }
    }
    newPolygons.push(...holePolygons)
    return newPolygons
  }
}
