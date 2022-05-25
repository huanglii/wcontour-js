class Border {
  constructor() {
    this.lineList = [];
  }
  getLineNum() {
    return this.lineList.length;
  }
}
class Extent {
  constructor(xMin, xMax, yMin, yMax) {
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;
  }
  include(e) {
    return this.xMin <= e.xMin && this.xMax >= e.xMax && this.yMin <= e.yMin && this.yMax >= e.yMax;
  }
}
class BorderLine {
  constructor() {
    this.extent = new Extent();
    this.pointList = [];
    this.ijPointList = [];
  }
}
class PointD {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  clone() {
    return new PointD(this.x, this.y);
  }
}
class BorderPoint {
  constructor() {
    this.point = new PointD();
  }
  clone() {
    let borderPoint = new BorderPoint();
    borderPoint.id = this.id;
    borderPoint.borderIdx = this.borderIdx;
    borderPoint.bInnerIdx = this.bInnerIdx;
    borderPoint.point = this.point;
    borderPoint.value = this.value;
    return borderPoint;
  }
}
class EndPoint {
  constructor() {
    this.sPoint = new PointD();
    this.point = new PointD();
  }
}
class IJPoint {
  constructor(i, j) {
    this.i = i;
    this.j = j;
  }
}
class PolyLine {
  constructor() {
    this.pointList = [];
  }
}
function doubleEquals(a, b) {
  let difference = Math.abs(a * 1e-5);
  return Math.abs(a - b) <= difference;
}
function distance_point2line(pt1, pt2, point) {
  let k = (pt2.y - pt1.y) / (pt2.x - pt1.x);
  let x = (k * k * pt1.x + k * (point.y - pt1.y) + point.x) / (k * k + 1);
  let y = k * (x - pt1.x) + pt1.y;
  let dis = Math.sqrt((point.y - y) * (point.y - y) + (point.x - x) * (point.x - x));
  return dis;
}
function getExtent(pList) {
  let minX, minY, maxX, maxY;
  let i;
  let aPoint = pList[0];
  minX = aPoint.x;
  maxX = aPoint.x;
  minY = aPoint.y;
  maxY = aPoint.y;
  for (i = 1; i < pList.length; i++) {
    aPoint = pList[i];
    if (aPoint.x < minX) {
      minX = aPoint.x;
    }
    if (aPoint.x > maxX) {
      maxX = aPoint.x;
    }
    if (aPoint.y < minY) {
      minY = aPoint.y;
    }
    if (aPoint.y > maxY) {
      maxY = aPoint.y;
    }
  }
  let aExtent = new Extent();
  aExtent.xMin = minX;
  aExtent.yMin = minY;
  aExtent.xMax = maxX;
  aExtent.yMax = maxY;
  return aExtent;
}
function getExtentAndArea(pList, aExtent) {
  let bArea, minX, minY, maxX, maxY;
  let i;
  let aPoint = pList[0];
  minX = aPoint.x;
  maxX = aPoint.x;
  minY = aPoint.y;
  maxY = aPoint.y;
  for (i = 1; i < pList.length; i++) {
    aPoint = pList[i];
    if (aPoint.x < minX) {
      minX = aPoint.x;
    }
    if (aPoint.x > maxX) {
      maxX = aPoint.x;
    }
    if (aPoint.y < minY) {
      minY = aPoint.y;
    }
    if (aPoint.y > maxY) {
      maxY = aPoint.y;
    }
  }
  aExtent.xMin = minX;
  aExtent.yMin = minY;
  aExtent.xMax = maxX;
  aExtent.yMax = maxY;
  bArea = (maxX - minX) * (maxY - minY);
  return bArea;
}
function isClockwise(pointList) {
  let i;
  let aPoint;
  let yMax = 0;
  let yMaxIdx = 0;
  for (i = 0; i < pointList.length - 1; i++) {
    aPoint = pointList[i];
    if (i === 0) {
      yMax = aPoint.y;
      yMaxIdx = 0;
    } else if (yMax < aPoint.y) {
      yMax = aPoint.y;
      yMaxIdx = i;
    }
  }
  let p1, p2, p3;
  let p1Idx, p2Idx, p3Idx;
  p1Idx = yMaxIdx - 1;
  p2Idx = yMaxIdx;
  p3Idx = yMaxIdx + 1;
  if (yMaxIdx === 0) {
    p1Idx = pointList.length - 2;
  }
  p1 = pointList[p1Idx];
  p2 = pointList[p2Idx];
  p3 = pointList[p3Idx];
  if ((p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y) > 0) {
    return true;
  } else {
    return false;
  }
}
function pointInPolygonByPList(poly, aPoint) {
  let inside = false;
  let nPoints = poly.length;
  if (nPoints < 3) {
    return false;
  }
  let xOld = poly[nPoints - 1].x;
  let yOld = poly[nPoints - 1].y;
  let x1, y1, x2, y2;
  for (let i = 0; i < nPoints; i++) {
    const xNew = poly[i].x;
    const yNew = poly[i].y;
    if (xNew > xOld) {
      x1 = xOld;
      x2 = xNew;
      y1 = yOld;
      y2 = yNew;
    } else {
      x1 = xNew;
      x2 = xOld;
      y1 = yNew;
      y2 = yOld;
    }
    if (xNew < aPoint.x === aPoint.x <= xOld && (aPoint.y - y1) * (x2 - x1) < (y2 - y1) * (aPoint.x - x1)) {
      inside = !inside;
    }
    xOld = xNew;
    yOld = yNew;
  }
  return inside;
}
function judgePolygonHighCenter(borderPolygons, closedPolygons, aLineList, borderList) {
  let aPolygon;
  let aLine;
  let newPList = [];
  let aBound;
  let aValue;
  let aPoint;
  if (borderPolygons.length === 0) {
    let max = aLineList[0].value, min = aLineList[0].value;
    for (let aPLine of aLineList) {
      if (aPLine.value > max) {
        max = aPLine.value;
      }
      if (aPLine.value < min) {
        min = aPLine.value;
      }
    }
    aPolygon = new Polygon();
    aValue = borderList[0].value;
    if (aValue < min) {
      max = min;
      min = aValue;
      aPolygon.isHighCenter = true;
    } else if (aValue > max) {
      min = max;
      max = aValue;
      aPolygon.isHighCenter = false;
    }
    aLine = new PolyLine();
    aLine.type = "Border";
    aLine.value = aValue;
    newPList = [];
    for (let aP of borderList) {
      newPList.push(aP.point);
    }
    aLine.pointList = [];
    aLine.pointList.push(...newPList);
    if (aLine.pointList.length > 0) {
      aPolygon.isBorder = true;
      aPolygon.lowValue = min;
      aPolygon.highValue = max;
      aBound = new Extent();
      aPolygon.area = getExtentAndArea(aLine.pointList, aBound);
      aPolygon.isClockWise = isClockwise(aLine.pointList);
      aPolygon.extent = aBound;
      aPolygon.outLine = aLine;
      aPolygon.holeLines = [];
      borderPolygons.push(aPolygon);
    }
  }
  borderPolygons.push(...closedPolygons);
  let cBound1, cBound2;
  let polygonNum = borderPolygons.length;
  let bPolygon;
  for (let i = 1; i < polygonNum; i++) {
    aPolygon = borderPolygons[i];
    if (aPolygon.outLine.type === "Close") {
      cBound1 = aPolygon.extent;
      aPoint = aPolygon.outLine.pointList[0];
      for (let j = i - 1; j >= 0; j--) {
        bPolygon = borderPolygons[j];
        cBound2 = bPolygon.extent;
        newPList = [];
        newPList.push(...bPolygon.outLine.pointList);
        if (pointInPolygonByPList(newPList, aPoint)) {
          if (cBound1.xMin > cBound2.xMin && cBound1.yMin > cBound2.yMin && cBound1.xMax < cBound2.xMax && cBound1.yMax < cBound2.yMax) {
            if (bPolygon.isHighCenter) {
              aPolygon.isHighCenter = aPolygon.highValue !== bPolygon.lowValue;
            } else {
              aPolygon.isHighCenter = aPolygon.lowValue === bPolygon.highValue;
            }
            break;
          }
        }
      }
    }
  }
  return borderPolygons;
}
function addHoles_Ring(polygonList, holeList) {
  for (let i = 0; i < holeList.length; i++) {
    let holePs = holeList[i];
    let aExtent = getExtent(holePs);
    for (let j = polygonList.length - 1; j >= 0; j--) {
      let aPolygon = polygonList[j];
      if (aPolygon.extent.include(aExtent)) {
        let isHole = true;
        for (let aP of holePs) {
          if (!pointInPolygonByPList(aPolygon.outLine.pointList, aP)) {
            isHole = false;
            break;
          }
        }
        if (isHole) {
          aPolygon.addHole(holePs);
          break;
        }
      }
    }
  }
}
function addPolygonHoles_Ring(polygonList) {
  let holePolygons = [];
  let i, j;
  for (i = 0; i < polygonList.length; i++) {
    let aPolygon = polygonList[i];
    if (!aPolygon.isBorder || aPolygon.isInnerBorder) {
      aPolygon.holeIndex = 1;
      holePolygons.push(aPolygon);
    }
  }
  if (holePolygons.length === 0) {
    return polygonList;
  } else {
    let newPolygons = [];
    for (i = 1; i < holePolygons.length; i++) {
      let aPolygon = holePolygons[i];
      for (j = i - 1; j >= 0; j--) {
        let bPolygon = holePolygons[j];
        if (bPolygon.extent.include(aPolygon.extent)) {
          if (pointInPolygonByPList(bPolygon.outLine.pointList, aPolygon.outLine.pointList[0])) {
            aPolygon.holeIndex = bPolygon.holeIndex + 1;
            bPolygon.addHole(aPolygon);
            break;
          }
        }
      }
    }
    let hole1Polygons = [];
    for (i = 0; i < holePolygons.length; i++) {
      if (holePolygons[i].holeIndex === 1) {
        hole1Polygons.push(holePolygons[i]);
      }
    }
    for (i = 0; i < polygonList.length; i++) {
      let aPolygon = polygonList[i];
      if (aPolygon.isBorder && !aPolygon.isInnerBorder) {
        for (j = 0; j < hole1Polygons.length; j++) {
          let bPolygon = hole1Polygons[j];
          if (aPolygon.extent.include(bPolygon.extent)) {
            if (pointInPolygonByPList(aPolygon.outLine.pointList, bPolygon.outLine.pointList[0])) {
              aPolygon.addHole(bPolygon);
            }
          }
        }
        newPolygons.push(aPolygon);
      }
    }
    newPolygons.push(...holePolygons);
    return newPolygons;
  }
}
class Polygon {
  constructor() {
    this.isInnerBorder = false;
    this.extent = new Extent();
    this.outLine = new PolyLine();
    this.holeLines = [];
  }
  clone() {
    let polygon = new Polygon();
    polygon.isBorder = this.isBorder;
    polygon.lowValue = this.lowValue;
    polygon.highValue = this.highValue;
    polygon.isClockWise = this.isClockWise;
    polygon.startPointIdx = this.startPointIdx;
    polygon.isHighCenter = this.isHighCenter;
    polygon.extent = this.extent;
    polygon.area = this.area;
    polygon.outLine = this.outLine;
    polygon.holeLines = this.holeLines;
    polygon.holeIndex = this.holeIndex;
    return polygon;
  }
  hasHoles() {
    return this.holeLines.length > 0;
  }
  addHole(polygon) {
    if (polygon instanceof Polygon) {
      this.holeLines.push(polygon.outLine);
    } else {
      let pList = polygon;
      if (isClockwise(pList)) {
        pList = pList.reverse();
      }
      const aLine = new PolyLine();
      aLine.pointList = pList;
      this.holeLines.push(aLine);
    }
  }
}
function canTraceBorder(s1, i1, i2, j1, j2, ij3) {
  let canTrace = true;
  let a, b, c, d;
  if (i1 < i2) {
    if (s1[i2][j2 - 1] === 1 && s1[i2][j2 + 1] === 1) {
      a = s1[i2 - 1][j2 - 1];
      b = s1[i2 + 1][j2];
      c = s1[i2 + 1][j2 - 1];
      if (a !== 0 && b === 0 || a === 0 && b !== 0 && c !== 0) {
        ij3[0] = i2;
        ij3[1] = j2 - 1;
      } else {
        ij3[0] = i2;
        ij3[1] = j2 + 1;
      }
    } else if (s1[i2][j2 - 1] === 1 && s1[i2 + 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1];
      b = s1[i2 + 1][j2 + 1];
      c = s1[i2][j2 - 1];
      d = s1[i2][j2 + 1];
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if (a === 0 && d === 0 || b === 0 && c === 0) {
          ij3[0] = i2;
          ij3[1] = j2 - 1;
        } else {
          ij3[0] = i2 + 1;
          ij3[1] = j2;
        }
      } else {
        ij3[0] = i2;
        ij3[1] = j2 - 1;
      }
    } else if (s1[i2][j2 + 1] === 1 && s1[i2 + 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1];
      b = s1[i2 + 1][j2 + 1];
      c = s1[i2][j2 - 1];
      d = s1[i2][j2 + 1];
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if (a === 0 && d === 0 || b === 0 && c === 0) {
          ij3[0] = i2;
          ij3[1] = j2 + 1;
        } else {
          ij3[0] = i2 + 1;
          ij3[1] = j2;
        }
      } else {
        ij3[0] = i2;
        ij3[1] = j2 + 1;
      }
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2;
      ij3[1] = j2 - 1;
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2;
      ij3[1] = j2 + 1;
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1;
      ij3[1] = j2;
    } else {
      canTrace = false;
    }
  } else if (j1 < j2) {
    if (s1[i2 + 1][j2] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1];
      b = s1[i2][j2 + 1];
      c = s1[i2 + 1][j2 + 1];
      if (a !== 0 && b === 0 || a === 0 && b !== 0 && c !== 0) {
        ij3[0] = i2 + 1;
        ij3[1] = j2;
      } else {
        ij3[0] = i2 - 1;
        ij3[1] = j2;
      }
    } else if (s1[i2 + 1][j2] === 1 && s1[i2][j2 + 1] === 1) {
      c = s1[i2 - 1][j2];
      d = s1[i2 + 1][j2];
      a = s1[i2 - 1][j2 + 1];
      b = s1[i2 + 1][j2 + 1];
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if (a === 0 && d === 0 || b === 0 && c === 0) {
          ij3[0] = i2 + 1;
          ij3[1] = j2;
        } else {
          ij3[0] = i2;
          ij3[1] = j2 + 1;
        }
      } else {
        ij3[0] = i2 + 1;
        ij3[1] = j2;
      }
    } else if (s1[i2 - 1][j2] === 1 && s1[i2][j2 + 1] === 1) {
      c = s1[i2 - 1][j2];
      d = s1[i2 + 1][j2];
      a = s1[i2 - 1][j2 + 1];
      b = s1[i2 + 1][j2 + 1];
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if (a === 0 && d === 0 || b === 0 && c === 0) {
          ij3[0] = i2 - 1;
          ij3[1] = j2;
        } else {
          ij3[0] = i2;
          ij3[1] = j2 + 1;
        }
      } else {
        ij3[0] = i2 - 1;
        ij3[1] = j2;
      }
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1;
      ij3[1] = j2;
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1;
      ij3[1] = j2;
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2;
      ij3[1] = j2 + 1;
    } else {
      canTrace = false;
    }
  } else if (i1 > i2) {
    if (s1[i2][j2 - 1] === 1 && s1[i2][j2 + 1] === 1) {
      a = s1[i2 + 1][j2 - 1];
      b = s1[i2 - 1][j2];
      c = s1[i2 - 1][j2 + 1];
      if (a !== 0 && b === 0 || a === 0 && b !== 0 && c !== 0) {
        ij3[0] = i2;
        ij3[1] = j2 - 1;
      } else {
        ij3[0] = i2;
        ij3[1] = j2 + 1;
      }
    } else if (s1[i2][j2 - 1] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 - 1][j2 - 1];
      b = s1[i2 - 1][j2 + 1];
      c = s1[i2][j2 - 1];
      d = s1[i2][j2 + 1];
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if (a === 0 && d === 0 || b === 0 && c === 0) {
          ij3[0] = i2;
          ij3[1] = j2 - 1;
        } else {
          ij3[0] = i2 - 1;
          ij3[1] = j2;
        }
      } else {
        ij3[0] = i2;
        ij3[1] = j2 - 1;
      }
    } else if (s1[i2][j2 + 1] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 - 1][j2 - 1];
      b = s1[i2 - 1][j2 + 1];
      c = s1[i2][j2 - 1];
      d = s1[i2][j2 + 1];
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if (a === 0 && d === 0 || b === 0 && c === 0) {
          ij3[0] = i2;
          ij3[1] = j2 + 1;
        } else {
          ij3[0] = i2 - 1;
          ij3[1] = j2;
        }
      } else {
        ij3[0] = i2;
        ij3[1] = j2 + 1;
      }
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2;
      ij3[1] = j2 - 1;
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2;
      ij3[1] = j2 + 1;
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1;
      ij3[1] = j2;
    } else {
      canTrace = false;
    }
  } else if (j1 > j2) {
    if (s1[i2 + 1][j2] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 + 1][j2 + 1];
      b = s1[i2][j2 - 1];
      c = s1[i2 - 1][j2 - 1];
      if (a !== 0 && b === 0 || a === 0 && b !== 0 && c !== 0) {
        ij3[0] = i2 + 1;
        ij3[1] = j2;
      } else {
        ij3[0] = i2 - 1;
        ij3[1] = j2;
      }
    } else if (s1[i2 + 1][j2] === 1 && s1[i2][j2 - 1] === 1) {
      c = s1[i2 - 1][j2];
      d = s1[i2 + 1][j2];
      a = s1[i2 - 1][j2 - 1];
      b = s1[i2 + 1][j2 - 1];
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if (a === 0 && d === 0 || b === 0 && c === 0) {
          ij3[0] = i2 + 1;
          ij3[1] = j2;
        } else {
          ij3[0] = i2;
          ij3[1] = j2 - 1;
        }
      } else {
        ij3[0] = i2 + 1;
        ij3[1] = j2;
      }
    } else if (s1[i2 - 1][j2] === 1 && s1[i2][j2 - 1] === 1) {
      c = s1[i2 - 1][j2];
      d = s1[i2 + 1][j2];
      a = s1[i2 - 1][j2 - 1];
      b = s1[i2 + 1][j2 - 1];
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if (a === 0 && d === 0 || b === 0 && c === 0) {
          ij3[0] = i2 - 1;
          ij3[1] = j2;
        } else {
          ij3[0] = i2;
          ij3[1] = j2 - 1;
        }
      } else {
        ij3[0] = i2 - 1;
        ij3[1] = j2;
      }
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1;
      ij3[1] = j2;
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1;
      ij3[1] = j2;
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2;
      ij3[1] = j2 - 1;
    } else {
      canTrace = false;
    }
  }
  return canTrace;
}
function canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS) {
  let canTrace = true;
  let a3x = 0, a3y = 0;
  let i3 = 0, j3 = 0;
  let isS = true;
  if (i1 < i2) {
    if (H[i2][j2] !== -2 && H[i2][j2 + 1] !== -2) {
      if (H[i2][j2] < H[i2][j2 + 1]) {
        a3x = X[j2];
        a3y = Y[i2] + H[i2][j2] * (Y[i2 + 1] - Y[i2]);
        i3 = i2;
        j3 = j2;
        H[i3][j3] = -2;
        isS = false;
      } else {
        a3x = X[j2 + 1];
        a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2]);
        i3 = i2;
        j3 = j2 + 1;
        H[i3][j3] = -2;
        isS = false;
      }
    } else if (H[i2][j2] !== -2 && H[i2][j2 + 1] === -2) {
      a3x = X[j2];
      a3y = Y[i2] + H[i2][j2] * (Y[i2 + 1] - Y[i2]);
      i3 = i2;
      j3 = j2;
      H[i3][j3] = -2;
      isS = false;
    } else if (H[i2][j2] === -2 && H[i2][j2 + 1] !== -2) {
      a3x = X[j2 + 1];
      a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2]);
      i3 = i2;
      j3 = j2 + 1;
      H[i3][j3] = -2;
      isS = false;
    } else if (S[i2 + 1][j2] !== -2) {
      a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2]);
      a3y = Y[i2 + 1];
      i3 = i2 + 1;
      j3 = j2;
      S[i3][j3] = -2;
      isS = true;
    } else {
      canTrace = false;
    }
  } else if (j1 < j2) {
    if (S[i2][j2] !== -2 && S[i2 + 1][j2] !== -2) {
      if (S[i2][j2] < S[i2 + 1][j2]) {
        a3x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2]);
        a3y = Y[i2];
        i3 = i2;
        j3 = j2;
        S[i3][j3] = -2;
        isS = true;
      } else {
        a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2]);
        a3y = Y[i2 + 1];
        i3 = i2 + 1;
        j3 = j2;
        S[i3][j3] = -2;
        isS = true;
      }
    } else if (S[i2][j2] !== -2 && S[i2 + 1][j2] === -2) {
      a3x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2]);
      a3y = Y[i2];
      i3 = i2;
      j3 = j2;
      S[i3][j3] = -2;
      isS = true;
    } else if (S[i2][j2] === -2 && S[i2 + 1][j2] !== -2) {
      a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2]);
      a3y = Y[i2 + 1];
      i3 = i2 + 1;
      j3 = j2;
      S[i3][j3] = -2;
      isS = true;
    } else if (H[i2][j2 + 1] !== -2) {
      a3x = X[j2 + 1];
      a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2]);
      i3 = i2;
      j3 = j2 + 1;
      H[i3][j3] = -2;
      isS = false;
    } else {
      canTrace = false;
    }
  } else if (X[j2] < a2x) {
    if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] !== -2) {
      if (H[i2 - 1][j2] > H[i2 - 1][j2 + 1]) {
        a3x = X[j2];
        a3y = Y[i2 - 1] + H[i2 - 1][j2] * (Y[i2] - Y[i2 - 1]);
        i3 = i2 - 1;
        j3 = j2;
        H[i3][j3] = -2;
        isS = false;
      } else {
        a3x = X[j2 + 1];
        a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * (Y[i2] - Y[i2 - 1]);
        i3 = i2 - 1;
        j3 = j2 + 1;
        H[i3][j3] = -2;
        isS = false;
      }
    } else if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] === -2) {
      a3x = X[j2];
      a3y = Y[i2 - 1] + H[i2 - 1][j2] * (Y[i2] - Y[i2 - 1]);
      i3 = i2 - 1;
      j3 = j2;
      H[i3][j3] = -2;
      isS = false;
    } else if (H[i2 - 1][j2] === -2 && H[i2 - 1][j2 + 1] !== -2) {
      a3x = X[j2 + 1];
      a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * (Y[i2] - Y[i2 - 1]);
      i3 = i2 - 1;
      j3 = j2 + 1;
      H[i3][j3] = -2;
      isS = false;
    } else if (S[i2 - 1][j2] !== -2) {
      a3x = X[j2] + S[i2 - 1][j2] * (X[j2 + 1] - X[j2]);
      a3y = Y[i2 - 1];
      i3 = i2 - 1;
      j3 = j2;
      S[i3][j3] = -2;
      isS = true;
    } else {
      canTrace = false;
    }
  } else {
    if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] !== -2) {
      if (S[i2 + 1][j2 - 1] > S[i2][j2 - 1]) {
        a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * (X[j2] - X[j2 - 1]);
        a3y = Y[i2 + 1];
        i3 = i2 + 1;
        j3 = j2 - 1;
        S[i3][j3] = -2;
        isS = true;
      } else {
        a3x = X[j2 - 1] + S[i2][j2 - 1] * (X[j2] - X[j2 - 1]);
        a3y = Y[i2];
        i3 = i2;
        j3 = j2 - 1;
        S[i3][j3] = -2;
        isS = true;
      }
    } else if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] === -2) {
      a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * (X[j2] - X[j2 - 1]);
      a3y = Y[i2 + 1];
      i3 = i2 + 1;
      j3 = j2 - 1;
      S[i3][j3] = -2;
      isS = true;
    } else if (S[i2 + 1][j2 - 1] === -2 && S[i2][j2 - 1] !== -2) {
      a3x = X[j2 - 1] + S[i2][j2 - 1] * (X[j2] - X[j2 - 1]);
      a3y = Y[i2];
      i3 = i2;
      j3 = j2 - 1;
      S[i3][j3] = -2;
      isS = true;
    } else if (H[i2][j2 - 1] !== -2) {
      a3x = X[j2 - 1];
      a3y = Y[i2] + H[i2][j2 - 1] * (Y[i2 + 1] - Y[i2]);
      i3 = i2;
      j3 = j2 - 1;
      H[i3][j3] = -2;
      isS = false;
    } else {
      canTrace = false;
    }
  }
  ij3[0] = i3;
  ij3[1] = j3;
  a3xy[0] = a3x;
  a3xy[1] = a3y;
  IsS[0] = isS;
  return canTrace;
}
function tracingPolygons_Ring(LineList, borderList, aBorder, contour, pNums) {
  let aPolygonList = [];
  let aLineList;
  let aLine;
  let aPoint;
  let aPolygon;
  let aBound;
  let i;
  let j;
  aLineList = [];
  aLineList.push(...LineList);
  let aPList;
  let newPList;
  let bP;
  let bP1;
  let timesArray = [];
  timesArray.length = borderList.length - 1;
  for (i = 0; i < timesArray.length; i++) {
    timesArray[i] = 0;
  }
  let pIdx;
  let pNum;
  let vNum;
  let aValue = 0;
  let bValue = 0;
  let cValue = 0;
  let lineBorderList = [];
  let borderIdx1;
  let borderIdx2;
  let innerIdx;
  pNum = borderList.length;
  for (i = 0; i < pNum; i++) {
    if (borderList[i].id === -1) {
      continue;
    }
    pIdx = i;
    lineBorderList.push(borderList[i]);
    let sameBorderIdx = false;
    if (timesArray[pIdx] < 2) {
      bP = borderList[pIdx];
      innerIdx = bP.bInnerIdx;
      aPList = [];
      let bIdxList = [];
      aPList.push(bP.point);
      bIdxList.push(pIdx);
      borderIdx1 = bP.borderIdx;
      borderIdx2 = borderIdx1;
      pIdx += 1;
      innerIdx += 1;
      if (innerIdx === pNums[borderIdx1] - 1) {
        pIdx = pIdx - (pNums[borderIdx1] - 1);
      }
      vNum = 0;
      do {
        bP = borderList[pIdx];
        if (bP.id === -1) {
          if (timesArray[pIdx] === 1) {
            break;
          }
          cValue = bP.value;
          aPList.push(bP.point);
          timesArray[pIdx] += 1;
          bIdxList.push(pIdx);
        } else {
          if (timesArray[pIdx] === 2) {
            break;
          }
          timesArray[pIdx] += 1;
          bIdxList.push(pIdx);
          aLine = aLineList[bP.id];
          if (vNum === 0) {
            aValue = aLine.value;
            bValue = aLine.value;
            vNum += 1;
          } else if (aValue === bValue) {
            if (aLine.value > aValue) {
              bValue = aLine.value;
            } else if (aLine.value < aValue) {
              aValue = aLine.value;
            }
            vNum += 1;
          }
          newPList = [];
          newPList.push(...aLine.pointList);
          aPoint = newPList[0];
          if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
            newPList.reverse();
          }
          aPList.push(...newPList);
          for (j = 0; j < borderList.length; j++) {
            if (j !== pIdx) {
              bP1 = borderList[j];
              if (bP1.id === bP.id) {
                pIdx = j;
                innerIdx = bP1.bInnerIdx;
                timesArray[pIdx] += 1;
                bIdxList.push(pIdx);
                borderIdx2 = bP1.borderIdx;
                if (bP.borderIdx > 0 && bP.borderIdx === bP1.borderIdx) {
                  sameBorderIdx = true;
                }
                break;
              }
            }
          }
        }
        if (pIdx === i) {
          if (aPList.length > 0) {
            if (sameBorderIdx) {
              let isTooBig = false;
              let baseNum = 0;
              for (let idx = 0; idx < bP.borderIdx; idx++) {
                baseNum += pNums[idx];
              }
              let sIdx = baseNum;
              let eIdx = baseNum + pNums[bP.borderIdx];
              let theIdx = sIdx;
              for (let idx = sIdx; idx < eIdx; idx++) {
                if (bIdxList.indexOf(idx) < 0) {
                  theIdx = idx;
                  break;
                }
              }
              if (pointInPolygonByPList(aPList, borderList[theIdx].point)) {
                isTooBig = true;
              }
              if (isTooBig) {
                break;
              }
            }
            aPolygon = new Polygon();
            aPolygon.isBorder = true;
            aPolygon.isInnerBorder = sameBorderIdx;
            aPolygon.lowValue = aValue;
            aPolygon.highValue = bValue;
            aBound = new Extent();
            aPolygon.area = getExtentAndArea(aPList, aBound);
            aPolygon.isClockWise = true;
            aPolygon.startPointIdx = lineBorderList.length - 1;
            aPolygon.extent = aBound;
            aPolygon.outLine.pointList = aPList;
            aPolygon.outLine.value = aValue;
            aPolygon.isHighCenter = true;
            if (aValue === bValue) {
              if (cValue < aValue) {
                aPolygon.isHighCenter = false;
              }
            }
            aPolygon.outLine.type = "Border";
            aPolygon.holeLines = [];
            aPolygonList.push(aPolygon);
          }
          break;
        }
        pIdx += 1;
        innerIdx += 1;
        if (borderIdx1 !== borderIdx2) {
          borderIdx1 = borderIdx2;
        }
        if (innerIdx === pNums[borderIdx1] - 1) {
          pIdx = pIdx - (pNums[borderIdx1] - 1);
          innerIdx = 0;
        }
      } while (true);
    }
    sameBorderIdx = false;
    pIdx = i;
    if (timesArray[pIdx] < 2) {
      aPList = [];
      let bIdxList = [];
      bP = borderList[pIdx];
      innerIdx = bP.bInnerIdx;
      aPList.push(bP.point);
      bIdxList.push(pIdx);
      borderIdx1 = bP.borderIdx;
      borderIdx2 = borderIdx1;
      pIdx += -1;
      innerIdx += -1;
      if (innerIdx === -1) {
        pIdx = pIdx + (pNums[borderIdx1] - 1);
      }
      vNum = 0;
      do {
        bP = borderList[pIdx];
        if (bP.id === -1) {
          if (timesArray[pIdx] === 1) {
            break;
          }
          cValue = bP.value;
          aPList.push(bP.point);
          bIdxList.push(pIdx);
          timesArray[pIdx] += 1;
        } else {
          if (timesArray[pIdx] === 2) {
            break;
          }
          timesArray[pIdx] += 1;
          bIdxList.push(pIdx);
          aLine = aLineList[bP.id];
          if (vNum === 0) {
            aValue = aLine.value;
            bValue = aLine.value;
            vNum += 1;
          } else if (aValue === bValue) {
            if (aLine.value > aValue) {
              bValue = aLine.value;
            } else if (aLine.value < aValue) {
              aValue = aLine.value;
            }
            vNum += 1;
          }
          newPList = [];
          newPList.push(...aLine.pointList);
          aPoint = newPList[0];
          if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
            newPList.reverse();
          }
          aPList.push(...newPList);
          for (j = 0; j < borderList.length; j++) {
            if (j !== pIdx) {
              bP1 = borderList[j];
              if (bP1.id === bP.id) {
                pIdx = j;
                innerIdx = bP1.bInnerIdx;
                timesArray[pIdx] += 1;
                bIdxList.push(pIdx);
                borderIdx2 = bP1.borderIdx;
                if (bP.borderIdx > 0 && bP.borderIdx === bP1.borderIdx) {
                  sameBorderIdx = true;
                }
                break;
              }
            }
          }
        }
        if (pIdx === i) {
          if (aPList.length > 0) {
            if (sameBorderIdx) {
              let isTooBig = false;
              let baseNum = 0;
              for (let idx = 0; idx < bP.borderIdx; idx++) {
                baseNum += pNums[idx];
              }
              let sIdx = baseNum;
              let eIdx = baseNum + pNums[bP.borderIdx];
              let theIdx = sIdx;
              for (let idx = sIdx; idx < eIdx; idx++) {
                if (bIdxList.indexOf(idx) < 0) {
                  theIdx = idx;
                  break;
                }
              }
              if (pointInPolygonByPList(aPList, borderList[theIdx].point)) {
                isTooBig = true;
              }
              if (isTooBig) {
                break;
              }
            }
            aPolygon = new Polygon();
            aPolygon.isBorder = true;
            aPolygon.isInnerBorder = sameBorderIdx;
            aPolygon.lowValue = aValue;
            aPolygon.highValue = bValue;
            aBound = new Extent();
            aPolygon.area = getExtentAndArea(aPList, aBound);
            aPolygon.isClockWise = false;
            aPolygon.startPointIdx = lineBorderList.length - 1;
            aPolygon.extent = aBound;
            aPolygon.outLine.pointList = aPList;
            aPolygon.outLine.value = aValue;
            aPolygon.isHighCenter = true;
            if (aValue === bValue) {
              if (cValue < aValue) {
                aPolygon.isHighCenter = false;
              }
            }
            aPolygon.outLine.type = "Border";
            aPolygon.holeLines = [];
            aPolygonList.push(aPolygon);
          }
          break;
        }
        pIdx += -1;
        innerIdx += -1;
        if (borderIdx1 !== borderIdx2) {
          borderIdx1 = borderIdx2;
        }
        if (innerIdx === -1) {
          pIdx = pIdx + pNums[borderIdx1];
          innerIdx = pNums[borderIdx1] - 1;
        }
      } while (true);
    }
  }
  let cPolygonlist = [];
  let isInserted;
  for (i = 0; i < aLineList.length; i++) {
    aLine = aLineList[i];
    if (aLine.type === "Close") {
      aPolygon = new Polygon();
      aPolygon.isBorder = false;
      aPolygon.lowValue = aLine.value;
      aPolygon.highValue = aLine.value;
      aBound = new Extent();
      aPolygon.area = getExtentAndArea(aLine.pointList, aBound);
      aPolygon.isClockWise = isClockwise(aLine.pointList);
      aPolygon.extent = aBound;
      aPolygon.outLine = aLine;
      aPolygon.isHighCenter = true;
      aPolygon.holeLines = [];
      isInserted = false;
      for (j = 0; j < cPolygonlist.length; j++) {
        if (aPolygon.area > cPolygonlist[j].area) {
          cPolygonlist.splice(j, 0, aPolygon);
          isInserted = true;
          break;
        }
      }
      if (!isInserted) {
        cPolygonlist.push(aPolygon);
      }
    }
  }
  if (aPolygonList.length === 0) {
    aLine = new PolyLine();
    aLine.type = "Border";
    aLine.value = contour[0];
    aLine.pointList = [];
    aLine.pointList.push(...aBorder.lineList[0].pointList);
    if (aLine.pointList.length > 0) {
      aPolygon = new Polygon();
      aPolygon.lowValue = aLine.value;
      aPolygon.highValue = aLine.value;
      aBound = new Extent();
      aPolygon.area = getExtentAndArea(aLine.pointList, aBound);
      aPolygon.isClockWise = isClockwise(aLine.pointList);
      aPolygon.extent = aBound;
      aPolygon.outLine = aLine;
      aPolygon.isHighCenter = false;
      aPolygonList.push(aPolygon);
    }
  }
  aPolygonList.push(...cPolygonlist);
  let cBound1;
  let cBound2;
  let polygonNum = aPolygonList.length;
  let bPolygon;
  for (i = polygonNum - 1; i >= 0; i += -1) {
    aPolygon = aPolygonList[i];
    if (aPolygon.outLine.type === "Close") {
      cBound1 = aPolygon.extent;
      aValue = aPolygon.lowValue;
      aPoint = aPolygon.outLine.pointList[0];
      for (j = i - 1; j >= 0; j += -1) {
        bPolygon = aPolygonList[j];
        cBound2 = bPolygon.extent;
        bValue = bPolygon.lowValue;
        newPList = [];
        newPList.push(...bPolygon.outLine.pointList);
        if (pointInPolygonByPList(newPList, aPoint)) {
          if (cBound1.xMin > cBound2.xMin && cBound1.yMin > cBound2.yMin && cBound1.xMax < cBound2.xMax && cBound1.yMax < cBound2.yMax) {
            if (aValue < bValue) {
              aPolygon.isHighCenter = false;
            } else if (aValue === bValue) {
              if (bPolygon.isHighCenter) {
                aPolygon.isHighCenter = false;
              }
            }
            break;
          }
        }
      }
    }
  }
  return aPolygonList;
}
function tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, isForward) {
  let a, b, c, d, val1, val2;
  let dx, dy;
  let xNum = X.length;
  let yNum = Y.length;
  let deltX = X[1] - X[0];
  let deltY = Y[1] - Y[0];
  let ii = iijj[0];
  let jj = iijj[1];
  a = Dx[ii][jj];
  b = Dx[ii][jj + 1];
  c = Dx[ii + 1][jj];
  d = Dx[ii + 1][jj + 1];
  val1 = a + (c - a) * ((aPoint.y - Y[ii]) / deltY);
  val2 = b + (d - b) * ((aPoint.y - Y[ii]) / deltY);
  dx = val1 + (val2 - val1) * ((aPoint.x - X[jj]) / deltX);
  a = Dy[ii][jj];
  b = Dy[ii][jj + 1];
  c = Dy[ii + 1][jj];
  d = Dy[ii + 1][jj + 1];
  val1 = a + (c - a) * ((aPoint.y - Y[ii]) / deltY);
  val2 = b + (d - b) * ((aPoint.y - Y[ii]) / deltY);
  dy = val1 + (val2 - val1) * ((aPoint.x - X[jj]) / deltX);
  if (isForward) {
    aPoint.x += dx;
    aPoint.y += dy;
  } else {
    aPoint.x -= dx;
    aPoint.y -= dy;
  }
  if (!(aPoint.x >= X[jj] && aPoint.x <= X[jj + 1] && aPoint.y >= Y[ii] && aPoint.y <= Y[ii + 1])) {
    if (aPoint.x < X[0] || aPoint.x > X[X.length - 1] || aPoint.y < Y[0] || aPoint.y > Y[Y.length - 1]) {
      return false;
    }
    for (let ti = ii - 2; ti < ii + 3; ti++) {
      if (ti >= 0 && ti < yNum) {
        if (aPoint.y >= Y[ti] && aPoint.y <= Y[ti + 1]) {
          ii = ti;
          for (let tj = jj - 2; tj < jj + 3; tj++) {
            if (tj >= 0 && tj < xNum) {
              if (aPoint.x >= X[tj] && aPoint.x <= X[tj + 1]) {
                jj = tj;
                break;
              }
            }
          }
          break;
        }
      }
    }
  }
  iijj[0] = ii;
  iijj[1] = jj;
  return true;
}
const _Contour = class {
  constructor(s0, xs, ys, undefData) {
    this._borders = [];
    this._s0 = s0;
    this._m = s0.length;
    this._n = s0[0].length;
    this._xs = xs;
    this._ys = ys;
    this._undefData = undefData;
    this._s1 = this._tracingDataFlag();
    this._borders = this._tracingBorders();
  }
  _tracingDataFlag() {
    let s1 = [];
    const { _s0, _m, _n, _undefData } = this;
    for (let i = 0; i < _m; i++) {
      s1[i] = [];
      for (let j = 0; j < _n; j++) {
        s1[i][j] = doubleEquals(_s0[i][j], _undefData) ? 0 : 1;
      }
    }
    for (let i = 1; i < _m - 1; i++) {
      for (let j = 1; j < _n - 1; j++) {
        if (s1[i][j] === 1) {
          let l = s1[i][j - 1];
          let r = s1[i][j + 1];
          let b = s1[i - 1][j];
          let t = s1[i + 1][j];
          let lb = s1[i - 1][j - 1];
          let rb = s1[i - 1][j + 1];
          let lt = s1[i + 1][j - 1];
          let rt = s1[i + 1][j + 1];
          if (l > 0 && r > 0 && b > 0 && t > 0 && lb > 0 && rb > 0 && lt > 0 && rt > 0) {
            s1[i][j] = 2;
          }
          if (l + r + b + t + lb + rb + lt + rt <= 2) {
            s1[i][j] = 0;
          }
        }
      }
    }
    let isContinue;
    while (true) {
      isContinue = false;
      for (let i = 1; i < _m - 1; i++) {
        for (let j = 1; j < _n - 1; j++) {
          if (s1[i][j] === 1) {
            let l = s1[i][j - 1];
            let r = s1[i][j + 1];
            let b = s1[i - 1][j];
            let t = s1[i + 1][j];
            let lb = s1[i - 1][j - 1];
            let rb = s1[i - 1][j + 1];
            let lt = s1[i + 1][j - 1];
            let rt = s1[i + 1][j + 1];
            if (l === 0 && r === 0 || b === 0 && t === 0) {
              s1[i][j] = 0;
              isContinue = true;
            }
            if (lt === 0 && r === 0 && b === 0 || rt === 0 && l === 0 && b === 0 || lb === 0 && r === 0 && t === 0 || rb === 0 && l === 0 && t === 0) {
              s1[i][j] = 0;
              isContinue = true;
            }
          }
        }
      }
      if (!isContinue) {
        break;
      }
    }
    for (let j = 0; j < _n; j++) {
      if (s1[0][j] === 1) {
        if (s1[1][j] === 0) {
          s1[0][j] = 0;
        } else if (j === 0) {
          if (s1[0][j + 1] === 0) {
            s1[0][j] = 0;
          }
        } else if (j === _n - 1) {
          if (s1[0][_n - 2] === 0) {
            s1[0][j] = 0;
          }
        } else if (s1[0][j - 1] === 0 && s1[0][j + 1] === 0) {
          s1[0][j] = 0;
        }
      }
      if (s1[_m - 1][j] === 1) {
        if (s1[_m - 2][j] === 0) {
          s1[_m - 1][j] = 0;
        } else if (j === 0) {
          if (s1[_m - 1][j + 1] === 0) {
            s1[_m - 1][j] = 0;
          }
        } else if (j === _n - 1) {
          if (s1[_m - 1][_n - 2] === 0) {
            s1[_m - 1][j] = 0;
          }
        } else if (s1[_m - 1][j - 1] === 0 && s1[_m - 1][j + 1] === 0) {
          s1[_m - 1][j] = 0;
        }
      }
    }
    for (let i = 0; i < _m; i++) {
      if (s1[i][0] === 1) {
        if (s1[i][1] === 0) {
          s1[i][0] = 0;
        } else if (i === 0) {
          if (s1[i + 1][0] === 0) {
            s1[i][0] = 0;
          }
        } else if (i === _m - 1) {
          if (s1[_m - 2][0] === 0) {
            s1[i][0] = 0;
          }
        } else if (s1[i - 1][0] === 0 && s1[i + 1][0] === 0) {
          s1[i][0] = 0;
        }
      }
      if (s1[i][_n - 1] === 1) {
        if (s1[i][_n - 2] === 0) {
          s1[i][_n - 1] = 0;
        } else if (i === 0) {
          if (s1[i + 1][_n - 1] === 0) {
            s1[i][_n - 1] = 0;
          }
        } else if (i === _m - 1) {
          if (s1[_m - 2][_n - 1] === 0) {
            s1[i][_n - 1] = 0;
          }
        } else if (s1[i - 1][_n - 1] === 0 && s1[i + 1][_n - 1] === 0) {
          s1[i][_n - 1] = 0;
        }
      }
    }
    return s1;
  }
  _tracingBorders() {
    const { _s1, _m, _n, _xs, _ys } = this;
    let borderLines = [];
    let s2 = [];
    for (let i = 0; i < _m + 2; i++) {
      s2[i] = [];
      for (let j = 0; j < _n + 2; j++) {
        if (i === 0 || i === _m + 1) {
          s2[i][j] = 0;
        } else if (j === 0 || j === _n + 1) {
          s2[i][j] = 0;
        } else {
          s2[i][j] = _s1[i - 1][j - 1];
        }
      }
    }
    let uNum = [];
    for (let i = 0; i < _m + 2; i++) {
      uNum[i] = [];
      for (let j = 0; j < _n + 2; j++) {
        if (s2[i][j] === 1) {
          let l = s2[i][j - 1];
          let r = s2[i][j + 1];
          let b = s2[i - 1][j];
          let t = s2[i + 1][j];
          let lb = s2[i - 1][j - 1];
          let rb = s2[i - 1][j + 1];
          let lt = s2[i + 1][j - 1];
          let rt = s2[i + 1][j + 1];
          if (l === 1 && r === 1 && b === 1 && t === 1 && (lb === 0 && rt === 0 || rb === 0 && lt === 0)) {
            uNum[i][j] = 2;
          } else {
            uNum[i][j] = 1;
          }
        } else {
          uNum[i][j] = 0;
        }
      }
    }
    for (let i = 1; i < _m + 1; i++) {
      for (let j = 1; j < _n + 1; j++) {
        if (s2[i][j] === 1) {
          let pointList = [];
          let ijPList = [];
          pointList.push(new PointD(_xs[j - 1], _ys[i - 1]));
          ijPList.push(new IJPoint(i - 1, j - 1));
          let i3 = 0;
          let j3 = 0;
          let i2 = i;
          let j2 = j;
          let i1 = i2;
          let j1 = -1;
          while (true) {
            let ij3 = [];
            ij3[0] = i3;
            ij3[1] = j3;
            if (canTraceBorder(s2, i1, i2, j1, j2, ij3)) {
              i3 = ij3[0];
              j3 = ij3[1];
              i1 = i2;
              j1 = j2;
              i2 = i3;
              j2 = j3;
              uNum[i3][j3] = uNum[i3][j3] - 1;
              if (uNum[i3][j3] === 0) {
                s2[i3][j3] = 3;
              }
            } else {
              break;
            }
            pointList.push(new PointD(_xs[j3 - 1], _ys[i3 - 1]));
            ijPList.push(new IJPoint(i3 - 1, j3 - 1));
            if (i3 === i && j3 === j) {
              break;
            }
          }
          uNum[i][j] = uNum[i][j] - 1;
          if (uNum[i][j] === 0) {
            s2[i][j] = 3;
          }
          if (pointList.length > 1) {
            let aBLine = new BorderLine();
            aBLine.area = getExtentAndArea(pointList, aBLine.extent);
            aBLine.isOutLine = true;
            aBLine.isClockwise = true;
            aBLine.pointList = pointList;
            aBLine.ijPointList = ijPList;
            borderLines.push(aBLine);
          }
        }
      }
    }
    let borders = [];
    for (let i = 1; i < borderLines.length; i++) {
      const aLine = borderLines[i];
      for (let j = 0; j < i; j++) {
        const bLine = borderLines[i];
        if (aLine.area > bLine.area) {
          borderLines.splice(i, 1);
          borderLines.splice(j, 0, aLine);
          break;
        }
      }
    }
    let lineList;
    if (borderLines.length === 1) {
      const aLine = borderLines[0];
      if (!isClockwise(aLine.pointList)) {
        aLine.pointList = aLine.pointList.reverse();
        aLine.ijPointList.reverse();
      }
      aLine.isClockwise = true;
      lineList = [];
      lineList.push(aLine);
      let aBorder = new Border();
      aBorder.lineList = lineList;
      borders.push(aBorder);
    } else {
      for (let i = 0; i < borderLines.length; i++) {
        if (i === borderLines.length) {
          break;
        }
        const aLine = borderLines[i];
        if (!isClockwise(aLine.pointList)) {
          aLine.pointList.reverse();
          aLine.ijPointList.reverse();
        }
        aLine.isClockwise = true;
        lineList = [];
        lineList.push(aLine);
        for (let j = i + 1; j < borderLines.length; j++) {
          if (j === borderLines.length) {
            break;
          }
          const bLine = borderLines[i];
          if (bLine.extent.xMin > aLine.extent.xMin && bLine.extent.xMax < aLine.extent.xMax && bLine.extent.yMin > aLine.extent.yMin && bLine.extent.yMax < aLine.extent.yMax) {
            const aPoint = bLine.pointList[0];
            if (pointInPolygonByPList(aLine.pointList, aPoint)) {
              bLine.isOutLine = false;
              if (isClockwise(bLine.pointList)) {
                bLine.pointList.reverse();
                bLine.ijPointList.reverse();
              }
              bLine.isClockwise = false;
              lineList.push(bLine);
              borderLines.splice(j, 1);
              j = j - 1;
            }
          }
        }
        let aBorder = new Border();
        aBorder.lineList = lineList;
        borders.push(aBorder);
      }
    }
    return borders;
  }
  tracingContourLines(breaks) {
    const { _s0, _s1, _xs, _ys, _m, _n, _borders, _undefData } = this;
    let contourLineList = [];
    let cLineList;
    let dShift = breaks[0] * 1e-5;
    if (dShift === 0) {
      dShift = 1e-5;
    }
    for (let i = 0; i < _m; i++) {
      for (let j = 0; j < _n; j++) {
        if (!doubleEquals(_s0[i][j], _undefData)) {
          _s0[i][j] = _s0[i][j] + dShift;
        }
      }
    }
    let SB = [];
    let HB = [];
    SB[0] = [];
    SB[1] = [];
    HB[0] = [];
    HB[1] = [];
    for (let i = 0; i < _m; i++) {
      SB[0][i] = [];
      SB[1][i] = [];
      HB[0][i] = [];
      HB[1][i] = [];
      for (let j = 0; j < _n; j++) {
        if (j < _n - 1) {
          SB[0][i][j] = -1;
          SB[1][i][j] = -1;
        }
        if (i < _m - 1) {
          HB[0][i][j] = -1;
          HB[1][i][j] = -1;
        }
      }
    }
    let k, si, sj;
    let aijP, bijP;
    for (let i = 0; i < _borders.length; i++) {
      const aBorder = _borders[i];
      for (let j = 0; j < aBorder.getLineNum(); j++) {
        const aBLine = aBorder.lineList[j];
        const ijPList = aBLine.ijPointList;
        for (k = 0; k < ijPList.length - 1; k++) {
          aijP = ijPList[k];
          bijP = ijPList[k + 1];
          if (aijP.i === bijP.i) {
            si = aijP.i;
            sj = Math.min(aijP.j, bijP.j);
            SB[0][si][sj] = i;
            if (bijP.j > aijP.j) {
              SB[1][si][sj] = 1;
            } else {
              SB[1][si][sj] = 0;
            }
          } else {
            sj = aijP.j;
            si = Math.min(aijP.i, bijP.i);
            HB[0][si][sj] = i;
            if (bijP.i > aijP.i) {
              HB[1][si][sj] = 0;
            } else {
              HB[1][si][sj] = 1;
            }
          }
        }
      }
    }
    let S = [];
    let H = [];
    let w;
    let c;
    for (c = 0; c < breaks.length; c++) {
      w = breaks[c];
      for (let i = 0; i < _m; i++) {
        S[i] = [];
        H[i] = [];
        for (let j = 0; j < _n; j++) {
          if (j < _n - 1) {
            if (_s1[i][j] !== 0 && _s1[i][j + 1] !== 0) {
              if ((_s0[i][j] - w) * (_s0[i][j + 1] - w) < 0) {
                S[i][j] = (w - _s0[i][j]) / (_s0[i][j + 1] - _s0[i][j]);
              } else {
                S[i][j] = -2;
              }
            } else {
              S[i][j] = -2;
            }
          }
          if (i < _m - 1) {
            if (_s1[i][j] !== 0 && _s1[i + 1][j] !== 0) {
              if ((_s0[i][j] - w) * (_s0[i + 1][j] - w) < 0) {
                H[i][j] = (w - _s0[i][j]) / (_s0[i + 1][j] - _s0[i][j]);
              } else {
                H[i][j] = -2;
              }
            } else {
              H[i][j] = -2;
            }
          }
        }
      }
      cLineList = _Contour.isoline_UndefData(_s0, _xs, _ys, w, S, H, SB, HB, contourLineList.length);
      for (let ln of cLineList) {
        contourLineList.push(ln);
      }
    }
    for (let i = 0; i < _borders.length; i++) {
      const aBorder = _borders[i];
      const aBLine = aBorder.lineList[0];
      for (let j = 0; j < contourLineList.length; j++) {
        const aLine = contourLineList[j];
        if (aLine.type === "Close") {
          const aPoint = aLine.pointList[0];
          if (pointInPolygonByPList(aBLine.pointList, aPoint)) {
            aLine.borderIdx = i;
          }
        }
        contourLineList.splice(j, 1);
        contourLineList.splice(j, 0, aLine);
      }
    }
    return contourLineList;
  }
  tracingPolygons(cLineList, breaks) {
    const S0 = this._s0;
    const borderList = this._borders;
    let aPolygonList = [];
    let newPolygonList = [];
    let newBPList;
    let bPList = [];
    let PList;
    let aBorder;
    let aBLine;
    let aPoint;
    let aBPoint;
    let i, j;
    let lineList = [];
    let aBorderList = [];
    let aLine;
    let aPolygon;
    let aijP;
    let aValue = 0;
    let pNums;
    for (i = 0; i < borderList.length; i++) {
      aBorderList = [];
      bPList = [];
      lineList = [];
      aPolygonList = [];
      aBorder = borderList[i];
      aBLine = aBorder.lineList[0];
      PList = aBLine.pointList;
      if (!isClockwise(PList)) {
        PList.reverse();
      }
      if (aBorder.getLineNum() === 1) {
        for (j = 0; j < PList.length; j++) {
          aPoint = PList[j];
          aBPoint = new BorderPoint();
          aBPoint.id = -1;
          aBPoint.point = aPoint;
          aBPoint.value = S0[aBLine.ijPointList[j].i][aBLine.ijPointList[j].j];
          aBorderList.push(aBPoint);
        }
        for (j = 0; j < cLineList.length; j++) {
          aLine = cLineList[j];
          if (aLine.borderIdx === i) {
            lineList.push(aLine);
            if (aLine.type === "Border") {
              aPoint = aLine.pointList[0];
              aBPoint = new BorderPoint();
              aBPoint.id = lineList.length - 1;
              aBPoint.point = aPoint;
              aBPoint.value = aLine.value;
              bPList.push(aBPoint);
              aPoint = aLine.pointList[aLine.pointList.length - 1];
              aBPoint = new BorderPoint();
              aBPoint.id = lineList.length - 1;
              aBPoint.point = aPoint;
              aBPoint.value = aLine.value;
              bPList.push(aBPoint);
            }
          }
        }
        if (lineList.length === 0) {
          aijP = aBLine.ijPointList[0];
          aPolygon = new Polygon();
          if (S0[aijP.i][aijP.j] < breaks[0]) {
            aValue = breaks[0];
            aPolygon.isHighCenter = false;
          } else {
            for (j = breaks.length - 1; j >= 0; j--) {
              if (S0[aijP.i][aijP.j] > breaks[j]) {
                aValue = breaks[j];
                break;
              }
            }
            aPolygon.isHighCenter = true;
          }
          if (PList.length > 0) {
            aPolygon.isBorder = true;
            aPolygon.highValue = aValue;
            aPolygon.lowValue = aValue;
            aPolygon.extent = new Extent();
            aPolygon.area = getExtentAndArea(PList, aPolygon.extent);
            aPolygon.startPointIdx = 0;
            aPolygon.isClockWise = true;
            aPolygon.outLine.type = "Border";
            aPolygon.outLine.value = aValue;
            aPolygon.outLine.borderIdx = i;
            aPolygon.outLine.pointList = PList;
            aPolygon.holeLines = [];
            aPolygonList.push(aPolygon);
          }
        } else {
          if (bPList.length > 0) {
            newBPList = _Contour.insertPoint2Border(bPList, aBorderList);
          } else {
            newBPList = aBorderList;
          }
          aPolygonList = _Contour.tracingPolygons_Line_Border(lineList, newBPList);
        }
        aPolygonList = _Contour.addPolygonHoles(aPolygonList);
      } else {
        aBLine = aBorder.lineList[0];
        for (j = 0; j < cLineList.length; j++) {
          aLine = cLineList[j];
          if (aLine.borderIdx === i) {
            lineList.push(aLine);
            if (aLine.type === "Border") {
              aPoint = aLine.pointList[0];
              aBPoint = new BorderPoint();
              aBPoint.id = lineList.length - 1;
              aBPoint.point = aPoint;
              aBPoint.value = aLine.value;
              bPList.push(aBPoint);
              aPoint = aLine.pointList[aLine.pointList.length - 1];
              aBPoint = new BorderPoint();
              aBPoint.id = lineList.length - 1;
              aBPoint.point = aPoint;
              aBPoint.value = aLine.value;
              bPList.push(aBPoint);
            }
          }
        }
        if (lineList.length === 0) {
          aijP = aBLine.ijPointList[0];
          aPolygon = new Polygon();
          if (S0[aijP.i][aijP.j] < breaks[0]) {
            aValue = breaks[0];
            aPolygon.isHighCenter = false;
          } else {
            for (j = breaks.length - 1; j >= 0; j--) {
              if (S0[aijP.i][aijP.j] > breaks[j]) {
                aValue = breaks[j];
                break;
              }
            }
            aPolygon.isHighCenter = true;
          }
          if (PList.length > 0) {
            aPolygon.isBorder = true;
            aPolygon.highValue = aValue;
            aPolygon.lowValue = aValue;
            aPolygon.area = getExtentAndArea(PList, aPolygon.extent);
            aPolygon.startPointIdx = 0;
            aPolygon.isClockWise = true;
            aPolygon.outLine.type = "Border";
            aPolygon.outLine.value = aValue;
            aPolygon.outLine.borderIdx = i;
            aPolygon.outLine.pointList = PList;
            aPolygon.holeLines = [];
            aPolygonList.push(aPolygon);
          }
        } else {
          pNums = [];
          pNums.length = aBorder.getLineNum();
          newBPList = _Contour.insertPoint2Border_Ring(S0, bPList, aBorder, pNums);
          aPolygonList = tracingPolygons_Ring(lineList, newBPList, aBorder, breaks, pNums);
          let sortList = [];
          while (aPolygonList.length > 0) {
            let isInsert = false;
            for (j = 0; j < sortList.length; j++) {
              if (aPolygonList[0].area > sortList[j].area) {
                sortList.push(aPolygonList[0]);
                isInsert = true;
                break;
              }
            }
            if (!isInsert) {
              sortList.push(aPolygonList[0]);
            }
            aPolygonList.splice(0, 1);
          }
          aPolygonList = sortList;
        }
        let holeList = [];
        for (j = 0; j < aBorder.getLineNum(); j++) {
          holeList.push(aBorder.lineList[j].pointList);
        }
        if (holeList.length > 0) {
          addHoles_Ring(aPolygonList, holeList);
        }
        aPolygonList = addPolygonHoles_Ring(aPolygonList);
      }
      newPolygonList.push(...aPolygonList);
    }
    for (let nPolygon of newPolygonList) {
      if (!isClockwise(nPolygon.outLine.pointList)) {
        nPolygon.outLine.pointList.reverse();
      }
    }
    return newPolygonList;
  }
  static isoline_UndefData(S0, X, Y, W, S, H, SB, HB, lineNum) {
    let cLineList = [];
    let m, n, i, j;
    m = S0.length;
    n = S0[0].length;
    let i1, i2, j1, j2, i3 = 0, j3 = 0;
    let a2x, a2y, a3x = 0, a3y = 0, sx, sy;
    let aPoint;
    let aLine;
    let pList;
    let isS = true;
    let aEndPoint = new EndPoint();
    for (i = 0; i < m; i++) {
      for (j = 0; j < n; j++) {
        if (j < n - 1) {
          if (SB[0][i][j] > -1) {
            if (S[i][j] !== -2) {
              pList = [];
              i2 = i;
              j2 = j;
              a2x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2]);
              a2y = Y[i2];
              if (SB[1][i][j] === 0) {
                i1 = -1;
                aEndPoint.sPoint.x = X[j + 1];
                aEndPoint.sPoint.y = Y[i];
              } else {
                i1 = i2;
                aEndPoint.sPoint.x = X[j];
                aEndPoint.sPoint.y = Y[i];
              }
              j1 = j2;
              aPoint = new PointD();
              aPoint.x = a2x;
              aPoint.y = a2y;
              pList.push(aPoint);
              aEndPoint.index = lineNum + cLineList.length;
              aEndPoint.point = aPoint;
              aEndPoint.borderIdx = SB[0][i][j];
              _Contour._endPointList.push(aEndPoint);
              aLine = new PolyLine();
              aLine.type = "Border";
              aLine.borderIdx = SB[0][i][j];
              while (true) {
                let ij3 = [i3, j3];
                let a3xy = [a3x, a3y];
                let IsS = [isS];
                if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
                  i3 = ij3[0];
                  j3 = ij3[1];
                  a3x = a3xy[0];
                  a3y = a3xy[1];
                  isS = IsS[0];
                  aPoint = new PointD();
                  aPoint.x = a3x;
                  aPoint.y = a3y;
                  pList.push(aPoint);
                  if (isS) {
                    if (SB[0][i3][j3] > -1) {
                      if (SB[1][i3][j3] === 0) {
                        aEndPoint.sPoint.x = X[j3 + 1];
                        aEndPoint.sPoint.y = Y[i3];
                      } else {
                        aEndPoint.sPoint.x = X[j3];
                        aEndPoint.sPoint.y = Y[i3];
                      }
                      break;
                    }
                  } else if (HB[0][i3][j3] > -1) {
                    if (HB[1][i3][j3] === 0) {
                      aEndPoint.sPoint.x = X[j3];
                      aEndPoint.sPoint.y = Y[i3];
                    } else {
                      aEndPoint.sPoint.x = X[j3];
                      aEndPoint.sPoint.y = Y[i3 + 1];
                    }
                    break;
                  }
                  a2x = a3x;
                  i1 = i2;
                  j1 = j2;
                  i2 = i3;
                  j2 = j3;
                } else {
                  aLine.type = "Error";
                  break;
                }
              }
              S[i][j] = -2;
              if (pList.length > 1 && !(aLine.type === "Error")) {
                aEndPoint.point = aPoint;
                _Contour._endPointList.push(aEndPoint);
                aLine.value = W;
                aLine.pointList = pList;
                cLineList.push(aLine);
              } else {
                _Contour._endPointList.pop();
              }
            }
          }
        }
        if (i < m - 1) {
          if (HB[0][i][j] > -1) {
            if (H[i][j] !== -2) {
              pList = [];
              i2 = i;
              j2 = j;
              a2x = X[j2];
              a2y = Y[i2] + H[i2][j2] * (Y[i2 + 1] - Y[i2]);
              i1 = i2;
              if (HB[1][i][j] === 0) {
                j1 = -1;
                aEndPoint.sPoint.x = X[j];
                aEndPoint.sPoint.y = Y[i];
              } else {
                j1 = j2;
                aEndPoint.sPoint.x = X[j];
                aEndPoint.sPoint.y = Y[i + 1];
              }
              aPoint = new PointD();
              aPoint.x = a2x;
              aPoint.y = a2y;
              pList.push(aPoint);
              aEndPoint.index = lineNum + cLineList.length;
              aEndPoint.point = aPoint;
              aEndPoint.borderIdx = HB[0][i][j];
              _Contour._endPointList.push(aEndPoint);
              aLine = new PolyLine();
              aLine.type = "Border";
              aLine.borderIdx = HB[0][i][j];
              while (true) {
                let ij3 = [i3, j3];
                let a3xy = [a3x, a3y];
                let IsS = [isS];
                if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
                  i3 = ij3[0];
                  j3 = ij3[1];
                  a3x = a3xy[0];
                  a3y = a3xy[1];
                  isS = IsS[0];
                  aPoint = new PointD();
                  aPoint.x = a3x;
                  aPoint.y = a3y;
                  pList.push(aPoint);
                  if (isS) {
                    if (SB[0][i3][j3] > -1) {
                      if (SB[1][i3][j3] === 0) {
                        aEndPoint.sPoint.x = X[j3 + 1];
                        aEndPoint.sPoint.y = Y[i3];
                      } else {
                        aEndPoint.sPoint.x = X[j3];
                        aEndPoint.sPoint.y = Y[i3];
                      }
                      break;
                    }
                  } else if (HB[0][i3][j3] > -1) {
                    if (HB[1][i3][j3] === 0) {
                      aEndPoint.sPoint.x = X[j3];
                      aEndPoint.sPoint.y = Y[i3];
                    } else {
                      aEndPoint.sPoint.x = X[j3];
                      aEndPoint.sPoint.y = Y[i3 + 1];
                    }
                    break;
                  }
                  a2x = a3x;
                  i1 = i2;
                  j1 = j2;
                  i2 = i3;
                  j2 = j3;
                } else {
                  aLine.type = "Error";
                  break;
                }
              }
              H[i][j] = -2;
              if (pList.length > 1 && !(aLine.type === "Error")) {
                aEndPoint.point = aPoint;
                _Contour._endPointList.push(aEndPoint);
                aLine.value = W;
                aLine.pointList = pList;
                cLineList.push(aLine);
              } else {
                _Contour._endPointList.pop();
              }
            }
          }
        }
      }
    }
    for (j = 0; j < n - 1; j++) {
      if (S[0][j] !== -2) {
        S[0][j] = -2;
      }
      if (S[m - 1][j] !== -2) {
        S[m - 1][j] = -2;
      }
    }
    for (i = 0; i < m - 1; i++) {
      if (H[i][0] !== -2) {
        H[i][0] = -2;
      }
      if (H[i][n - 1] !== -2) {
        H[i][n - 1] = -2;
      }
    }
    for (i = 1; i < m - 2; i++) {
      for (j = 1; j < n - 1; j++) {
        if (H[i][j] !== -2) {
          let pointList = [];
          i2 = i;
          j2 = j;
          a2x = X[j2];
          a2y = Y[i] + H[i][j2] * (Y[i + 1] - Y[i]);
          j1 = -1;
          i1 = i2;
          sx = a2x;
          sy = a2y;
          aPoint = new PointD();
          aPoint.x = a2x;
          aPoint.y = a2y;
          pointList.push(aPoint);
          aLine = new PolyLine();
          aLine.type = "Close";
          while (true) {
            let ij3 = [];
            let a3xy = [];
            let IsS = [];
            if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
              i3 = ij3[0];
              j3 = ij3[1];
              a3x = a3xy[0];
              a3y = a3xy[1];
              aPoint = new PointD();
              aPoint.x = a3x;
              aPoint.y = a3y;
              pointList.push(aPoint);
              if (Math.abs(a3y - sy) < 1e-6 && Math.abs(a3x - sx) < 1e-6) {
                break;
              }
              a2x = a3x;
              i1 = i2;
              j1 = j2;
              i2 = i3;
              j2 = j3;
            } else {
              aLine.type = "Error";
              break;
            }
          }
          H[i][j] = -2;
          if (pointList.length > 1 && !(aLine.type === "Error")) {
            aLine.value = W;
            aLine.pointList = pointList;
            cLineList.push(aLine);
          }
        }
      }
    }
    for (i = 1; i < m - 1; i++) {
      for (j = 1; j < n - 2; j++) {
        if (S[i][j] !== -2) {
          let pointList = [];
          i2 = i;
          j2 = j;
          a2x = X[j2] + S[i][j] * (X[j2 + 1] - X[j2]);
          a2y = Y[i];
          j1 = j2;
          i1 = -1;
          sx = a2x;
          sy = a2y;
          aPoint = new PointD();
          aPoint.x = a2x;
          aPoint.y = a2y;
          pointList.push(aPoint);
          aLine = new PolyLine();
          aLine.type = "Close";
          while (true) {
            let ij3 = [];
            let a3xy = [];
            let IsS = [];
            if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
              i3 = ij3[0];
              j3 = ij3[1];
              a3x = a3xy[0];
              a3y = a3xy[1];
              aPoint = new PointD();
              aPoint.x = a3x;
              aPoint.y = a3y;
              pointList.push(aPoint);
              if (Math.abs(a3y - sy) < 1e-6 && Math.abs(a3x - sx) < 1e-6) {
                break;
              }
              a2x = a3x;
              i1 = i2;
              j1 = j2;
              i2 = i3;
              j2 = j3;
            } else {
              aLine.type = "Error";
              break;
            }
          }
          S[i][j] = -2;
          if (pointList.length > 1 && !(aLine.type === "Error")) {
            aLine.value = W;
            aLine.pointList = pointList;
            cLineList.push(aLine);
          }
        }
      }
    }
    return cLineList;
  }
  static tracingPolygons_Line_Border(LineList, borderList) {
    if (LineList.length === 0) {
      return [];
    }
    let aPolygonList = [];
    let aLineList = [];
    let aLine;
    let aPoint;
    let aPolygon;
    let aBound;
    let i, j;
    aLineList.push(...LineList);
    let aPList;
    let newPList;
    let bP;
    let timesArray = [];
    timesArray.length = borderList.length - 1;
    for (i = 0; i < timesArray.length; i++) {
      timesArray[i] = 0;
    }
    let pIdx, pNum, vNum, vvNum;
    let aValue = 0, bValue = 0, cValue = 0;
    let lineBorderList = [];
    pNum = borderList.length - 1;
    for (i = 0; i < pNum; i++) {
      if (borderList[i].id === -1) {
        continue;
      }
      pIdx = i;
      aPList = [];
      lineBorderList.push(borderList[i]);
      if (timesArray[pIdx] < 2) {
        aPList.push(borderList[pIdx].point);
        pIdx += 1;
        if (pIdx === pNum) {
          pIdx = 0;
        }
        vNum = 0;
        vvNum = 0;
        while (true) {
          bP = borderList[pIdx];
          if (bP.id === -1) {
            if (timesArray[pIdx] === 1) {
              break;
            }
            cValue = bP.value;
            vvNum += 1;
            aPList.push(bP.point);
            timesArray[pIdx] += 1;
          } else {
            if (timesArray[pIdx] === 2) {
              break;
            }
            timesArray[pIdx] += 1;
            aLine = aLineList[bP.id];
            if (vNum === 0) {
              aValue = aLine.value;
              bValue = aLine.value;
              vNum += 1;
            } else {
              if (aLine.value > aValue) {
                bValue = aLine.value;
              } else if (aLine.value < aValue) {
                aValue = aLine.value;
              }
              vNum += 1;
            }
            newPList = [];
            newPList.push(...aLine.pointList);
            aPoint = newPList[0];
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              newPList.reverse();
            }
            aPList.push(...newPList);
            for (j = 0; j < borderList.length - 1; j++) {
              if (j !== pIdx) {
                if (borderList[j].id === bP.id) {
                  pIdx = j;
                  timesArray[pIdx] += 1;
                  break;
                }
              }
            }
          }
          if (pIdx === i) {
            if (aPList.length > 0) {
              aPolygon = new Polygon();
              aPolygon.isBorder = true;
              aPolygon.lowValue = aValue;
              aPolygon.highValue = bValue;
              aBound = new Extent();
              aPolygon.area = getExtentAndArea(aPList, aBound);
              aPolygon.isClockWise = true;
              aPolygon.startPointIdx = lineBorderList.length - 1;
              aPolygon.extent = aBound;
              aPolygon.outLine.pointList = aPList;
              aPolygon.outLine.value = aValue;
              aPolygon.isHighCenter = true;
              aPolygon.holeLines = [];
              if (vvNum > 0) {
                if (cValue < aValue) {
                  aPolygon.isHighCenter = false;
                  aPolygon.highValue = aValue;
                }
              }
              aPolygon.outLine.type = "Border";
              aPolygonList.push(aPolygon);
            }
            break;
          }
          pIdx += 1;
          if (pIdx === pNum) {
            pIdx = 0;
          }
        }
      }
      pIdx = i;
      if (timesArray[pIdx] < 2) {
        aPList = [];
        aPList.push(borderList[pIdx].point);
        pIdx += -1;
        if (pIdx === -1) {
          pIdx = pNum - 1;
        }
        vNum = 0;
        vvNum = 0;
        while (true) {
          bP = borderList[pIdx];
          if (bP.id === -1) {
            if (timesArray[pIdx] === 1) {
              break;
            }
            cValue = bP.value;
            vvNum += 1;
            aPList.push(bP.point);
            timesArray[pIdx] += 1;
          } else {
            if (timesArray[pIdx] === 2) {
              break;
            }
            timesArray[pIdx] += 1;
            aLine = aLineList[bP.id];
            if (vNum === 0) {
              aValue = aLine.value;
              bValue = aLine.value;
              vNum += 1;
            } else {
              if (aLine.value > aValue) {
                bValue = aLine.value;
              } else if (aLine.value < aValue) {
                aValue = aLine.value;
              }
              vNum += 1;
            }
            newPList = [];
            newPList.push(...aLine.pointList);
            aPoint = newPList[0];
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              newPList.reverse();
            }
            aPList.push(...newPList);
            for (j = 0; j < borderList.length - 1; j++) {
              if (j !== pIdx) {
                if (borderList[j].id === bP.id) {
                  pIdx = j;
                  timesArray[pIdx] += 1;
                  break;
                }
              }
            }
          }
          if (pIdx === i) {
            if (aPList.length > 0) {
              aPolygon = new Polygon();
              aPolygon.isBorder = true;
              aPolygon.lowValue = aValue;
              aPolygon.highValue = bValue;
              aBound = new Extent();
              aPolygon.area = getExtentAndArea(aPList, aBound);
              aPolygon.isClockWise = false;
              aPolygon.startPointIdx = lineBorderList.length - 1;
              aPolygon.extent = aBound;
              aPolygon.outLine.pointList = aPList;
              aPolygon.outLine.value = aValue;
              aPolygon.isHighCenter = true;
              aPolygon.holeLines = [];
              if (vvNum > 0) {
                if (cValue < aValue) {
                  aPolygon.isHighCenter = false;
                  aPolygon.highValue = aValue;
                }
              }
              aPolygon.outLine.type = "Border";
              aPolygonList.push(aPolygon);
            }
            break;
          }
          pIdx += -1;
          if (pIdx === -1) {
            pIdx = pNum - 1;
          }
        }
      }
    }
    let cPolygonlist = [];
    let isInserted;
    for (i = 0; i < aLineList.length; i++) {
      aLine = aLineList[i];
      if (aLine.type === "Close" && aLine.pointList.length > 0) {
        aPolygon = new Polygon();
        aPolygon.isBorder = false;
        aPolygon.lowValue = aLine.value;
        aPolygon.highValue = aLine.value;
        aBound = new Extent();
        aPolygon.area = getExtentAndArea(aLine.pointList, aBound);
        aPolygon.isClockWise = isClockwise(aLine.pointList);
        aPolygon.extent = aBound;
        aPolygon.outLine = aLine;
        aPolygon.isHighCenter = true;
        aPolygon.holeLines = [];
        isInserted = false;
        for (j = 0; j < cPolygonlist.length; j++) {
          if (aPolygon.area > cPolygonlist[j].area) {
            cPolygonlist.splice(j, 0, aPolygon);
            isInserted = true;
            break;
          }
        }
        if (!isInserted) {
          cPolygonlist.push(aPolygon);
        }
      }
    }
    aPolygonList = judgePolygonHighCenter(aPolygonList, cPolygonlist, aLineList, borderList);
    return aPolygonList;
  }
  static addPolygonHoles(polygonList) {
    let holePolygons = [];
    let i, j;
    for (i = 0; i < polygonList.length; i++) {
      let aPolygon = polygonList[i];
      if (!aPolygon.isBorder) {
        aPolygon.holeIndex = 1;
        holePolygons.push(aPolygon);
      }
    }
    if (holePolygons.length === 0) {
      return polygonList;
    } else {
      let newPolygons = [];
      for (i = 1; i < holePolygons.length; i++) {
        let aPolygon = holePolygons[i];
        for (j = i - 1; j >= 0; j--) {
          let bPolygon = holePolygons[j];
          if (bPolygon.extent.include(aPolygon.extent)) {
            if (pointInPolygonByPList(bPolygon.outLine.pointList, aPolygon.outLine.pointList[0])) {
              aPolygon.holeIndex = bPolygon.holeIndex + 1;
              bPolygon.addHole(aPolygon);
              break;
            }
          }
        }
      }
      let hole1Polygons = [];
      for (i = 0; i < holePolygons.length; i++) {
        if (holePolygons[i].holeIndex === 1) {
          hole1Polygons.push(holePolygons[i]);
        }
      }
      for (i = 0; i < polygonList.length; i++) {
        let aPolygon = polygonList[i];
        if (aPolygon.isBorder === true) {
          for (j = 0; j < hole1Polygons.length; j++) {
            let bPolygon = hole1Polygons[j];
            if (aPolygon.extent.include(bPolygon.extent)) {
              if (pointInPolygonByPList(aPolygon.outLine.pointList, bPolygon.outLine.pointList[0])) {
                aPolygon.addHole(bPolygon);
              }
            }
          }
          newPolygons.push(aPolygon);
        }
      }
      newPolygons.push(...holePolygons);
      return newPolygons;
    }
  }
  tracingStreamline(U, V, X, Y, UNDEF, density) {
    let streamLines = [];
    let xNum = U[1].length;
    let yNum = U.length;
    let Dx = [];
    let Dy = [];
    let deltX = X[1] - X[0];
    let deltY = Y[1] - Y[0];
    if (density === 0) {
      density = 1;
    }
    let radius = deltX / Math.pow(density, 2);
    let smallRadius = radius * 1.5;
    let i, j;
    for (i = 0; i < yNum; i++) {
      Dx[i] = [];
      Dy[i] = [];
      for (j = 0; j < xNum; j++) {
        if (Math.abs(U[i][j] / UNDEF - 1) < 0.01) {
          Dx[i][j] = 0.1;
          Dy[i][j] = 0.1;
        } else {
          let WS = Math.sqrt(U[i][j] * U[i][j] + V[i][j] * V[i][j]);
          if (WS === 0) {
            WS = 1;
          }
          Dx[i][j] = U[i][j] / WS * deltX / density;
          Dy[i][j] = V[i][j] / WS * deltY / density;
        }
      }
    }
    let SPoints = [];
    let flags = [];
    for (i = 0; i < yNum - 1; i++) {
      SPoints[i] = [];
      flags[i] = [];
      for (j = 0; j < xNum - 1; j++) {
        if (i % 2 === 0 && j % 2 === 0) {
          flags[i][j] = 0;
        } else {
          flags[i][j] = 1;
        }
        SPoints[i][j] = [];
      }
    }
    let dis;
    let borderP;
    let lineN = 0;
    for (i = 0; i < yNum - 1; i++) {
      for (j = 0; j < xNum - 1; j++) {
        if (flags[i][j] === 0) {
          let pList = [];
          let aPoint = new PointD();
          let ii, jj;
          let loopN;
          let aPL = new PolyLine();
          aPoint.x = X[j] + deltX / 2;
          aPoint.y = Y[i] + deltY / 2;
          pList.push(aPoint.clone());
          borderP = new BorderPoint();
          borderP.point = aPoint.clone();
          borderP.id = lineN;
          SPoints[i][j].push(borderP);
          flags[i][j] = 1;
          ii = i;
          jj = j;
          let loopLimit = 500;
          loopN = 0;
          while (loopN < loopLimit) {
            let iijj = [];
            iijj[0] = ii;
            iijj[1] = jj;
            let isInDomain = tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, true);
            ii = iijj[0];
            jj = iijj[1];
            if (isInDomain) {
              if (Math.abs(U[ii][jj] / UNDEF - 1) < 0.01 || Math.abs(U[ii][jj + 1] / UNDEF - 1) < 0.01 || Math.abs(U[ii + 1][jj] / UNDEF - 1) < 0.01 || Math.abs(U[ii + 1][jj + 1] / UNDEF - 1) < 0.01) {
                break;
              } else {
                let isTerminating = false;
                for (let sPoint of SPoints[ii][jj]) {
                  if (Math.sqrt((aPoint.x - sPoint.point.x) * (aPoint.x - sPoint.point.x) + (aPoint.y - sPoint.point.y) * (aPoint.y - sPoint.point.y)) < radius) {
                    isTerminating = true;
                    break;
                  }
                }
                if (!isTerminating) {
                  if (SPoints[ii][jj].length > 1) {
                    let pointStart = SPoints[ii][jj][0];
                    let pointEnd = SPoints[ii][jj][1];
                    if (!(lineN === pointStart.id && lineN === pointEnd.id)) {
                      dis = distance_point2line(pointStart.point, pointEnd.point, aPoint);
                      if (dis < smallRadius) {
                        isTerminating = true;
                      }
                    }
                  }
                }
                if (!isTerminating) {
                  pList.push(aPoint.clone());
                  borderP = new BorderPoint();
                  borderP.point = aPoint.clone();
                  borderP.id = lineN;
                  SPoints[ii][jj].push(borderP);
                  flags[ii][jj] = 1;
                } else {
                  break;
                }
              }
            } else {
              break;
            }
            loopN += 1;
          }
          aPoint.x = X[j] + deltX / 2;
          aPoint.y = Y[i] + deltY / 2;
          ii = i;
          jj = j;
          loopN = 0;
          while (loopN < loopLimit) {
            let iijj = [];
            iijj[0] = ii;
            iijj[1] = jj;
            let isInDomain = tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, false);
            ii = iijj[0];
            jj = iijj[1];
            if (isInDomain) {
              if (Math.abs(U[ii][jj] / UNDEF - 1) < 0.01 || Math.abs(U[ii][jj + 1] / UNDEF - 1) < 0.01 || Math.abs(U[ii + 1][jj] / UNDEF - 1) < 0.01 || Math.abs(U[ii + 1][jj + 1] / UNDEF - 1) < 0.01) {
                break;
              } else {
                let isTerminating = false;
                for (let sPoint of SPoints[ii][jj]) {
                  if (Math.sqrt((aPoint.x - sPoint.point.x) * (aPoint.x - sPoint.point.x) + (aPoint.y - sPoint.point.y) * (aPoint.y - sPoint.point.y)) < radius) {
                    isTerminating = true;
                    break;
                  }
                }
                if (!isTerminating) {
                  if (SPoints[ii][jj].length > 1) {
                    let pointStart = SPoints[ii][jj][0];
                    let pointEnd = SPoints[ii][jj][1];
                    if (!(lineN === pointStart.id && lineN === pointEnd.id)) {
                      dis = distance_point2line(pointStart.point, pointEnd.point, aPoint);
                      if (dis < smallRadius) {
                        isTerminating = true;
                      }
                    }
                  }
                }
                if (!isTerminating) {
                  pList.splice(0, 0, aPoint.clone());
                  borderP = new BorderPoint();
                  borderP.point = aPoint.clone();
                  borderP.id = lineN;
                  SPoints[ii][jj].push(borderP);
                  flags[ii][jj] = 1;
                } else {
                  break;
                }
              }
            } else {
              break;
            }
            loopN += 1;
          }
          if (pList.length > 1) {
            aPL.pointList = pList;
            streamLines.push(aPL);
            lineN += 1;
          }
        }
      }
    }
    return streamLines;
  }
  static insertPoint2Border(bPList, aBorderList) {
    let aBPoint, bP;
    let i, j;
    let p1, p2, p3;
    let BorderList = [];
    BorderList.push(...aBorderList);
    for (i = 0; i < bPList.length; i++) {
      bP = bPList[i];
      p3 = bP.point;
      aBPoint = BorderList[0];
      p1 = aBPoint.point;
      for (j = 1; j < BorderList.length; j++) {
        aBPoint = BorderList[j];
        p2 = aBPoint.point;
        if ((p3.x - p1.x) * (p3.x - p2.x) <= 0) {
          if ((p3.y - p1.y) * (p3.y - p2.y) <= 0) {
            if ((p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y) === 0) {
              BorderList.splice(j, 0, bP);
              break;
            }
          }
        }
        p1 = p2;
      }
    }
    return BorderList;
  }
  static insertPoint2Border_Ring(S0, bPList, aBorder, pNums) {
    let aBPoint, bP;
    let i, j, k;
    let p1, p2, p3;
    let aBLine;
    let newBPList = [], tempBPList = [], tempBPList1 = [];
    for (k = 0; k < aBorder.getLineNum(); k++) {
      aBLine = aBorder.lineList[k];
      tempBPList = [];
      for (i = 0; i < aBLine.pointList.length; i++) {
        aBPoint = new BorderPoint();
        aBPoint.id = -1;
        aBPoint.borderIdx = k;
        aBPoint.point = aBLine.pointList[i];
        aBPoint.value = S0[aBLine.ijPointList[i].i][aBLine.ijPointList[i].j];
        tempBPList.push(aBPoint);
      }
      for (i = 0; i < bPList.length; i++) {
        bP = bPList[i].clone();
        bP.borderIdx = k;
        p3 = bP.point;
        p1 = tempBPList[0].point.clone();
        for (j = 1; j < tempBPList.length; j++) {
          p2 = tempBPList[j].point.clone();
          if ((p3.x - p1.x) * (p3.x - p2.x) <= 0) {
            if ((p3.y - p1.y) * (p3.y - p2.y) <= 0) {
              if ((p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y) === 0) {
                tempBPList.splice(j, 0, bP);
                break;
              }
            }
          }
          p1 = p2;
        }
      }
      tempBPList1 = [];
      for (i = 0; i < tempBPList.length; i++) {
        bP = tempBPList[i];
        bP.bInnerIdx = i;
        tempBPList1.push(bP);
      }
      pNums[k] = tempBPList1.length;
      newBPList.push(...tempBPList1);
    }
    return newBPList;
  }
};
let Contour = _Contour;
Contour._endPointList = [];
function BSpline(pointList, t, i) {
  const f = fb(t);
  let x = 0;
  let y = 0;
  for (let j = 0; j < 4; j++) {
    const aPoint = pointList[i + j];
    x = x + f[j] * aPoint.x;
    y = y + f[j] * aPoint.y;
  }
  return [x, y];
}
function f0(t) {
  return 1 / 6 * (-t + 1) * (-t + 1) * (-t + 1);
}
function f1(t) {
  return 1 / 6 * (3 * t * t * t - 6 * t * t + 4);
}
function f2(t) {
  return 1 / 6 * (-3 * t * t * t + 3 * t * t + 3 * t + 1);
}
function f3(t) {
  return 1 / 6 * t * t * t;
}
function fb(t) {
  return [f0(t), f1(t), f2(t), f3(t)];
}
function BSplineScanning(pointList, sum) {
  let t;
  let i;
  let X, Y;
  let aPoint;
  let newPList = [];
  if (sum < 4) {
    return null;
  }
  let isClose = false;
  aPoint = pointList[0];
  let bPoint = pointList[sum - 1];
  if (aPoint.x === bPoint.x && aPoint.y === bPoint.y) {
    pointList.splice(0, 1);
    pointList.push(pointList[0]);
    pointList.push(pointList[1]);
    pointList.push(pointList[2]);
    pointList.push(pointList[3]);
    pointList.push(pointList[4]);
    pointList.push(pointList[5]);
    pointList.push(pointList[6]);
    isClose = true;
  }
  sum = pointList.length;
  for (i = 0; i < sum - 3; i++) {
    for (t = 0; t <= 1; t += 0.05) {
      let xy = BSpline(pointList, t, i);
      X = xy[0];
      Y = xy[1];
      if (isClose) {
        if (i > 3) {
          aPoint = new PointD();
          aPoint.x = X;
          aPoint.y = Y;
          newPList.push(aPoint);
        }
      } else {
        aPoint = new PointD();
        aPoint.x = X;
        aPoint.y = Y;
        newPList.push(aPoint);
      }
    }
  }
  if (isClose) {
    newPList.push(newPList[0]);
  } else {
    newPList.splice(0, 0, pointList[0]);
    newPList.push(pointList[pointList.length - 1]);
  }
  return newPList;
}
function smoothLines(aLineList) {
  let newLineList = [];
  for (let i = 0; i < aLineList.length; i++) {
    const aline = aLineList[i];
    const newPList = aline.pointList;
    if (newPList.length <= 1) {
      continue;
    }
    if (newPList.length === 2) {
      let bP = new PointD();
      let aP = newPList[0];
      let cP = newPList[1];
      bP.x = (cP.x - aP.x) / 4 + aP.x;
      bP.y = (cP.y - aP.y) / 4 + aP.y;
      newPList.splice(1, 0, bP);
      bP = new PointD();
      bP.x = (cP.x - aP.x) / 4 * 3 + aP.x;
      bP.y = (cP.y - aP.y) / 4 * 3 + aP.y;
      newPList.splice(2, 0, bP);
    }
    if (newPList.length === 3) {
      let bP = new PointD();
      let aP = newPList[0];
      let cP = newPList[1];
      bP.x = (cP.x - aP.x) / 2 + aP.x;
      bP.y = (cP.y - aP.y) / 2 + aP.y;
      newPList.splice(1, 0, bP);
    }
    const smoothedPList = BSplineScanning(newPList, newPList.length);
    aline.pointList = smoothedPList;
    newLineList.push(aline);
  }
  return newLineList;
}
function getLineStringFeature(line) {
  const coordinates = line.pointList.map((point) => [point.x, point.y]);
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates
    },
    properties: { value: line.value }
  };
}
function isolines(lines) {
  const features = [];
  for (const line of lines) {
    const feature = getLineStringFeature(line);
    features.push(feature);
  }
  return {
    type: "FeatureCollection",
    features
  };
}
function getPolygonFeature(polygon, breaks) {
  const { outLine, holeLines } = polygon;
  const coordinates = outLine.pointList.map((point) => [point.x, point.y]);
  const polygonCoordinates = [coordinates];
  let value = outLine.value;
  if (polygon.isHighCenter) {
    const idx = breaks.indexOf(polygon.lowValue);
    if (idx >= 0 && idx < breaks.length - 1) {
      value = breaks[idx + 1];
    } else {
      value = polygon.lowValue;
    }
  }
  if (polygon.hasHoles()) {
    for (let i = 0; i < holeLines.length; i++) {
      const hole = holeLines[i];
      const holeCoors = [];
      for (let _b = 0, _c = hole.pointList; _b < _c.length; _b++) {
        const pt = _c[_b];
        holeCoors.push([pt.x, pt.y]);
      }
      polygonCoordinates.push(holeCoors);
    }
  }
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: polygonCoordinates
    },
    properties: { value }
  };
}
function isobands(polygons, breaks) {
  const features = [];
  for (const polygon of polygons) {
    const feature = getPolygonFeature(polygon, breaks);
    features.push(feature);
  }
  return {
    type: "FeatureCollection",
    features
  };
}
export { Contour, isobands, isolines, smoothLines };
