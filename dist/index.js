/*
  * wcontour 0.0.1 (https://github.com/huanglii/wcontour-js)
  * API https://github.com/huanglii/wcontour-js/blob/master/doc/api.md
  * Copyright 2021-2021 huanglii. All Rights Reserved
  * Licensed under LGPL-3.0 (https://github.com/huanglii/wcontour-js/blob/master/LICENSE)
  */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.wcontour = {}));
}(this, (function (exports) { 'use strict';

  /**
   * Border class - contour line border
   */
  var Border = /** @class */ (function () {
      function Border() {
          this.lineList = [];
      }
      /**
       * Get line number
       * @returns
       */
      Border.prototype.getLineNum = function () {
          return this.lineList.length;
      };
      return Border;
  }());

  var Extent = /** @class */ (function () {
      function Extent(xMin, xMax, yMin, yMax) {
          this.xMin = xMin;
          this.xMax = xMax;
          this.yMin = yMin;
          this.yMax = yMax;
      }
      /**
       * Judge if this extent include another extent
       * @param e The extent
       * @returns Is included or not
       */
      Extent.prototype.include = function (e) {
          return this.xMin <= e.xMin && this.xMax >= e.xMax && this.yMin <= e.yMin && this.yMax >= e.yMax;
      };
      return Extent;
  }());

  var BorderLine = /** @class */ (function () {
      function BorderLine() {
          this.extent = new Extent();
          this.pointList = [];
          this.ijPointList = [];
      }
      return BorderLine;
  }());

  var PointD = /** @class */ (function () {
      function PointD(x, y) {
          if (x === void 0) { x = 0; }
          if (y === void 0) { y = 0; }
          this.x = x;
          this.y = y;
      }
      /**
       * Clone this point
       * @returns New point
       */
      PointD.prototype.clone = function () {
          return new PointD(this.x, this.y);
      };
      return PointD;
  }());

  /**
   * BorderPoint class
   */
  var BorderPoint = /** @class */ (function () {
      function BorderPoint() {
          this.point = new PointD();
      }
      /**
       * clone
       */
      BorderPoint.prototype.clone = function () {
          var borderPoint = new BorderPoint();
          borderPoint.id = this.id;
          borderPoint.borderIdx = this.borderIdx;
          borderPoint.bInnerIdx = this.bInnerIdx;
          borderPoint.point = this.point;
          borderPoint.value = this.value;
          return borderPoint;
      };
      return BorderPoint;
  }());

  var EndPoint = /** @class */ (function () {
      function EndPoint() {
          this.sPoint = new PointD();
          this.point = new PointD();
      }
      return EndPoint;
  }());

  /**
   * Point integer, to indicate the position in grid data
   */
  var IJPoint = /** @class */ (function () {
      function IJPoint(i, j) {
          this.i = i;
          this.j = j;
      }
      return IJPoint;
  }());

  var PolyLine = /** @class */ (function () {
      function PolyLine() {
          this.pointList = [];
      }
      return PolyLine;
  }());

  function doubleEquals(a, b) {
      var difference = Math.abs(a * 0.00001);
      return Math.abs(a - b) <= difference;
  }
  function distance_point2line(pt1, pt2, point) {
      var k = (pt2.y - pt1.y) / (pt2.x - pt1.x);
      var x = (k * k * pt1.x + k * (point.y - pt1.y) + point.x) / (k * k + 1);
      var y = k * (x - pt1.x) + pt1.y;
      var dis = Math.sqrt((point.y - y) * (point.y - y) + (point.x - x) * (point.x - x));
      return dis;
  }
  function getExtent(pList) {
      var minX, minY, maxX, maxY;
      var i;
      var aPoint = pList[0];
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
      var aExtent = new Extent();
      aExtent.xMin = minX;
      aExtent.yMin = minY;
      aExtent.xMax = maxX;
      aExtent.yMax = maxY;
      return aExtent;
  }
  function getExtentAndArea(pList, aExtent) {
      var bArea, minX, minY, maxX, maxY;
      var i;
      var aPoint = pList[0];
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
  /**
   * Determine if the point list is clockwise
   *
   * @param pointList point list
   * @return is or not clockwise
   */
  function isClockwise(pointList) {
      var i;
      var aPoint;
      var yMax = 0;
      var yMaxIdx = 0;
      for (i = 0; i < pointList.length - 1; i++) {
          aPoint = pointList[i];
          if (i === 0) {
              yMax = aPoint.y;
              yMaxIdx = 0;
          }
          else if (yMax < aPoint.y) {
              yMax = aPoint.y;
              yMaxIdx = i;
          }
      }
      var p1, p2, p3;
      var p1Idx, p2Idx, p3Idx;
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
      }
      else {
          return false;
      }
  }
  /**
   * Judge if a point is in a polygon
   *
   * @param poly polygon border
   * @param aPoint point
   * @return if the point is in the polygon
   */
  function pointInPolygonByPList(poly, aPoint) {
      var inside = false;
      var nPoints = poly.length;
      if (nPoints < 3) {
          return false;
      }
      var xOld = poly[nPoints - 1].x;
      var yOld = poly[nPoints - 1].y;
      var x1, y1, x2, y2;
      for (var i = 0; i < nPoints; i++) {
          var xNew = poly[i].x;
          var yNew = poly[i].y;
          if (xNew > xOld) {
              x1 = xOld;
              x2 = xNew;
              y1 = yOld;
              y2 = yNew;
          }
          else {
              x1 = xNew;
              x2 = xOld;
              y1 = yNew;
              y2 = yOld;
          }
          //---- edge "open" at left end
          if (xNew < aPoint.x === aPoint.x <= xOld &&
              (aPoint.y - y1) * (x2 - x1) < (y2 - y1) * (aPoint.x - x1)) {
              inside = !inside;
          }
          xOld = xNew;
          yOld = yNew;
      }
      return inside;
  }
  function judgePolygonHighCenter(borderPolygons, closedPolygons, aLineList, borderList) {
      var _a;
      var aPolygon;
      var aLine;
      var newPList = [];
      var aBound;
      var aValue;
      var aPoint;
      if (borderPolygons.length === 0) {
          //Add border polygon
          //Get max & min values
          var max = aLineList[0].value, min = aLineList[0].value;
          for (var _i = 0, aLineList_1 = aLineList; _i < aLineList_1.length; _i++) {
              var aPLine = aLineList_1[_i];
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
          }
          else if (aValue > max) {
              min = max;
              max = aValue;
              aPolygon.isHighCenter = false;
          }
          aLine = new PolyLine();
          aLine.type = 'Border';
          aLine.value = aValue;
          newPList = [];
          for (var _b = 0, borderList_1 = borderList; _b < borderList_1.length; _b++) {
              var aP = borderList_1[_b];
              newPList.push(aP.point);
          }
          aLine.pointList = [];
          (_a = aLine.pointList).push.apply(_a, newPList);
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
      //---- Add close polygons to form total polygons list
      borderPolygons.push.apply(borderPolygons, closedPolygons);
      //---- Juge isHighCenter for close polygons
      var cBound1, cBound2;
      var polygonNum = borderPolygons.length;
      var bPolygon;
      for (var i = 1; i < polygonNum; i++) {
          aPolygon = borderPolygons[i];
          if (aPolygon.outLine.type === 'Close') {
              cBound1 = aPolygon.extent;
              //aValue = aPolygon.lowValue;
              aPoint = aPolygon.outLine.pointList[0];
              for (var j = i - 1; j >= 0; j--) {
                  bPolygon = borderPolygons[j];
                  cBound2 = bPolygon.extent;
                  //bValue = bPolygon.lowValue;
                  newPList = [];
                  newPList.push.apply(newPList, bPolygon.outLine.pointList);
                  if (pointInPolygonByPList(newPList, aPoint)) {
                      if (cBound1.xMin > cBound2.xMin &&
                          cBound1.yMin > cBound2.yMin &&
                          cBound1.xMax < cBound2.xMax &&
                          cBound1.yMax < cBound2.yMax) {
                          if (bPolygon.isHighCenter) {
                              aPolygon.isHighCenter = aPolygon.highValue !== bPolygon.lowValue;
                          }
                          else {
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
      for (var i = 0; i < holeList.length; i++) {
          var holePs = holeList[i];
          var aExtent = getExtent(holePs);
          for (var j = polygonList.length - 1; j >= 0; j--) {
              var aPolygon = polygonList[j];
              if (aPolygon.extent.include(aExtent)) {
                  var isHole = true;
                  for (var _i = 0, holePs_1 = holePs; _i < holePs_1.length; _i++) {
                      var aP = holePs_1[_i];
                      if (!pointInPolygonByPList(aPolygon.outLine.pointList, aP)) {
                          isHole = false;
                          break;
                      }
                  }
                  if (isHole) {
                      aPolygon.addHole(holePs);
                      //polygonList[j] = aPolygon;
                      break;
                  }
              }
          }
      }
  }
  function addPolygonHoles_Ring(polygonList) {
      var holePolygons = [];
      var i, j;
      for (i = 0; i < polygonList.length; i++) {
          var aPolygon = polygonList[i];
          if (!aPolygon.isBorder || aPolygon.isInnerBorder) {
              aPolygon.holeIndex = 1;
              holePolygons.push(aPolygon);
          }
      }
      if (holePolygons.length === 0) {
          return polygonList;
      }
      else {
          var newPolygons = [];
          for (i = 1; i < holePolygons.length; i++) {
              var aPolygon = holePolygons[i];
              for (j = i - 1; j >= 0; j--) {
                  var bPolygon = holePolygons[j];
                  if (bPolygon.extent.include(aPolygon.extent)) {
                      if (pointInPolygonByPList(bPolygon.outLine.pointList, aPolygon.outLine.pointList[0])) {
                          aPolygon.holeIndex = bPolygon.holeIndex + 1;
                          bPolygon.addHole(aPolygon);
                          //holePolygons[i] = aPolygon;
                          //holePolygons[j] = bPolygon;
                          break;
                      }
                  }
              }
          }
          var hole1Polygons = [];
          for (i = 0; i < holePolygons.length; i++) {
              if (holePolygons[i].holeIndex === 1) {
                  hole1Polygons.push(holePolygons[i]);
              }
          }
          for (i = 0; i < polygonList.length; i++) {
              var aPolygon = polygonList[i];
              if (aPolygon.isBorder && !aPolygon.isInnerBorder) {
                  for (j = 0; j < hole1Polygons.length; j++) {
                      var bPolygon = hole1Polygons[j];
                      if (aPolygon.extent.include(bPolygon.extent)) {
                          if (pointInPolygonByPList(aPolygon.outLine.pointList, bPolygon.outLine.pointList[0])) {
                              aPolygon.addHole(bPolygon);
                          }
                      }
                  }
                  newPolygons.push(aPolygon);
              }
          }
          newPolygons.push.apply(newPolygons, holePolygons);
          return newPolygons;
      }
  }

  var Polygon = /** @class */ (function () {
      function Polygon() {
          this.isInnerBorder = false;
          this.extent = new Extent();
          this.outLine = new PolyLine();
          this.holeLines = [];
      }
      /**
       * clone
       */
      Polygon.prototype.clone = function () {
          var polygon = new Polygon();
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
      };
      /**
       * hasHoles
       */
      Polygon.prototype.hasHoles = function () {
          return this.holeLines.length > 0;
      };
      /**
       * addHole
       */
      Polygon.prototype.addHole = function (polygon) {
          if (polygon instanceof Polygon) {
              this.holeLines.push(polygon.outLine);
          }
          else {
              var pList = polygon;
              if (isClockwise(pList)) {
                  pList = pList.reverse();
              }
              var aLine = new PolyLine();
              aLine.pointList = pList;
              this.holeLines.push(aLine);
          }
      };
      return Polygon;
  }());

  function canTraceBorder(s1, i1, i2, j1, j2, ij3) {
      var canTrace = true;
      var a, b, c, d;
      if (i1 < i2) {
          //---- Trace from bottom
          if (s1[i2][j2 - 1] === 1 && s1[i2][j2 + 1] === 1) {
              a = s1[i2 - 1][j2 - 1];
              b = s1[i2 + 1][j2];
              c = s1[i2 + 1][j2 - 1];
              if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
                  ij3[0] = i2;
                  ij3[1] = j2 - 1;
              }
              else {
                  ij3[0] = i2;
                  ij3[1] = j2 + 1;
              }
          }
          else if (s1[i2][j2 - 1] === 1 && s1[i2 + 1][j2] === 1) {
              a = s1[i2 + 1][j2 - 1];
              b = s1[i2 + 1][j2 + 1];
              c = s1[i2][j2 - 1];
              d = s1[i2][j2 + 1];
              if (a === 0 || b === 0 || c === 0 || d === 0) {
                  if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
                      ij3[0] = i2;
                      ij3[1] = j2 - 1;
                  }
                  else {
                      ij3[0] = i2 + 1;
                      ij3[1] = j2;
                  }
              }
              else {
                  ij3[0] = i2;
                  ij3[1] = j2 - 1;
              }
          }
          else if (s1[i2][j2 + 1] === 1 && s1[i2 + 1][j2] === 1) {
              a = s1[i2 + 1][j2 - 1];
              b = s1[i2 + 1][j2 + 1];
              c = s1[i2][j2 - 1];
              d = s1[i2][j2 + 1];
              if (a === 0 || b === 0 || c === 0 || d === 0) {
                  if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
                      ij3[0] = i2;
                      ij3[1] = j2 + 1;
                  }
                  else {
                      ij3[0] = i2 + 1;
                      ij3[1] = j2;
                  }
              }
              else {
                  ij3[0] = i2;
                  ij3[1] = j2 + 1;
              }
          }
          else if (s1[i2][j2 - 1] === 1) {
              ij3[0] = i2;
              ij3[1] = j2 - 1;
          }
          else if (s1[i2][j2 + 1] === 1) {
              ij3[0] = i2;
              ij3[1] = j2 + 1;
          }
          else if (s1[i2 + 1][j2] === 1) {
              ij3[0] = i2 + 1;
              ij3[1] = j2;
          }
          else {
              canTrace = false;
          }
      }
      else if (j1 < j2) {
          //---- Trace from left
          if (s1[i2 + 1][j2] === 1 && s1[i2 - 1][j2] === 1) {
              a = s1[i2 + 1][j2 - 1];
              b = s1[i2][j2 + 1];
              c = s1[i2 + 1][j2 + 1];
              if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
                  ij3[0] = i2 + 1;
                  ij3[1] = j2;
              }
              else {
                  ij3[0] = i2 - 1;
                  ij3[1] = j2;
              }
          }
          else if (s1[i2 + 1][j2] === 1 && s1[i2][j2 + 1] === 1) {
              c = s1[i2 - 1][j2];
              d = s1[i2 + 1][j2];
              a = s1[i2 - 1][j2 + 1];
              b = s1[i2 + 1][j2 + 1];
              if (a === 0 || b === 0 || c === 0 || d === 0) {
                  if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
                      ij3[0] = i2 + 1;
                      ij3[1] = j2;
                  }
                  else {
                      ij3[0] = i2;
                      ij3[1] = j2 + 1;
                  }
              }
              else {
                  ij3[0] = i2 + 1;
                  ij3[1] = j2;
              }
          }
          else if (s1[i2 - 1][j2] === 1 && s1[i2][j2 + 1] === 1) {
              c = s1[i2 - 1][j2];
              d = s1[i2 + 1][j2];
              a = s1[i2 - 1][j2 + 1];
              b = s1[i2 + 1][j2 + 1];
              if (a === 0 || b === 0 || c === 0 || d === 0) {
                  if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
                      ij3[0] = i2 - 1;
                      ij3[1] = j2;
                  }
                  else {
                      ij3[0] = i2;
                      ij3[1] = j2 + 1;
                  }
              }
              else {
                  ij3[0] = i2 - 1;
                  ij3[1] = j2;
              }
          }
          else if (s1[i2 + 1][j2] === 1) {
              ij3[0] = i2 + 1;
              ij3[1] = j2;
          }
          else if (s1[i2 - 1][j2] === 1) {
              ij3[0] = i2 - 1;
              ij3[1] = j2;
          }
          else if (s1[i2][j2 + 1] === 1) {
              ij3[0] = i2;
              ij3[1] = j2 + 1;
          }
          else {
              canTrace = false;
          }
      }
      else if (i1 > i2) {
          //---- Trace from top
          if (s1[i2][j2 - 1] === 1 && s1[i2][j2 + 1] === 1) {
              a = s1[i2 + 1][j2 - 1];
              b = s1[i2 - 1][j2];
              c = s1[i2 - 1][j2 + 1];
              if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
                  ij3[0] = i2;
                  ij3[1] = j2 - 1;
              }
              else {
                  ij3[0] = i2;
                  ij3[1] = j2 + 1;
              }
          }
          else if (s1[i2][j2 - 1] === 1 && s1[i2 - 1][j2] === 1) {
              a = s1[i2 - 1][j2 - 1];
              b = s1[i2 - 1][j2 + 1];
              c = s1[i2][j2 - 1];
              d = s1[i2][j2 + 1];
              if (a === 0 || b === 0 || c === 0 || d === 0) {
                  if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
                      ij3[0] = i2;
                      ij3[1] = j2 - 1;
                  }
                  else {
                      ij3[0] = i2 - 1;
                      ij3[1] = j2;
                  }
              }
              else {
                  ij3[0] = i2;
                  ij3[1] = j2 - 1;
              }
          }
          else if (s1[i2][j2 + 1] === 1 && s1[i2 - 1][j2] === 1) {
              a = s1[i2 - 1][j2 - 1];
              b = s1[i2 - 1][j2 + 1];
              c = s1[i2][j2 - 1];
              d = s1[i2][j2 + 1];
              if (a === 0 || b === 0 || c === 0 || d === 0) {
                  if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
                      ij3[0] = i2;
                      ij3[1] = j2 + 1;
                  }
                  else {
                      ij3[0] = i2 - 1;
                      ij3[1] = j2;
                  }
              }
              else {
                  ij3[0] = i2;
                  ij3[1] = j2 + 1;
              }
          }
          else if (s1[i2][j2 - 1] === 1) {
              ij3[0] = i2;
              ij3[1] = j2 - 1;
          }
          else if (s1[i2][j2 + 1] === 1) {
              ij3[0] = i2;
              ij3[1] = j2 + 1;
          }
          else if (s1[i2 - 1][j2] === 1) {
              ij3[0] = i2 - 1;
              ij3[1] = j2;
          }
          else {
              canTrace = false;
          }
      }
      else if (j1 > j2) {
          //---- Trace from right
          if (s1[i2 + 1][j2] === 1 && s1[i2 - 1][j2] === 1) {
              a = s1[i2 + 1][j2 + 1];
              b = s1[i2][j2 - 1];
              c = s1[i2 - 1][j2 - 1];
              if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
                  ij3[0] = i2 + 1;
                  ij3[1] = j2;
              }
              else {
                  ij3[0] = i2 - 1;
                  ij3[1] = j2;
              }
          }
          else if (s1[i2 + 1][j2] === 1 && s1[i2][j2 - 1] === 1) {
              c = s1[i2 - 1][j2];
              d = s1[i2 + 1][j2];
              a = s1[i2 - 1][j2 - 1];
              b = s1[i2 + 1][j2 - 1];
              if (a === 0 || b === 0 || c === 0 || d === 0) {
                  if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
                      ij3[0] = i2 + 1;
                      ij3[1] = j2;
                  }
                  else {
                      ij3[0] = i2;
                      ij3[1] = j2 - 1;
                  }
              }
              else {
                  ij3[0] = i2 + 1;
                  ij3[1] = j2;
              }
          }
          else if (s1[i2 - 1][j2] === 1 && s1[i2][j2 - 1] === 1) {
              c = s1[i2 - 1][j2];
              d = s1[i2 + 1][j2];
              a = s1[i2 - 1][j2 - 1];
              b = s1[i2 + 1][j2 - 1];
              if (a === 0 || b === 0 || c === 0 || d === 0) {
                  if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
                      ij3[0] = i2 - 1;
                      ij3[1] = j2;
                  }
                  else {
                      ij3[0] = i2;
                      ij3[1] = j2 - 1;
                  }
              }
              else {
                  ij3[0] = i2 - 1;
                  ij3[1] = j2;
              }
          }
          else if (s1[i2 + 1][j2] === 1) {
              ij3[0] = i2 + 1;
              ij3[1] = j2;
          }
          else if (s1[i2 - 1][j2] === 1) {
              ij3[0] = i2 - 1;
              ij3[1] = j2;
          }
          else if (s1[i2][j2 - 1] === 1) {
              ij3[0] = i2;
              ij3[1] = j2 - 1;
          }
          else {
              canTrace = false;
          }
      }
      return canTrace;
  }
  function canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS) {
      var canTrace = true;
      var a3x = 0, a3y = 0;
      var i3 = 0, j3 = 0;
      var isS = true;
      if (i1 < i2) {
          //---- Trace from bottom
          if (H[i2][j2] !== -2 && H[i2][j2 + 1] !== -2) {
              if (H[i2][j2] < H[i2][j2 + 1]) {
                  a3x = X[j2];
                  a3y = Y[i2] + H[i2][j2] * (Y[i2 + 1] - Y[i2]);
                  i3 = i2;
                  j3 = j2;
                  H[i3][j3] = -2;
                  isS = false;
              }
              else {
                  a3x = X[j2 + 1];
                  a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2]);
                  i3 = i2;
                  j3 = j2 + 1;
                  H[i3][j3] = -2;
                  isS = false;
              }
          }
          else if (H[i2][j2] !== -2 && H[i2][j2 + 1] === -2) {
              a3x = X[j2];
              a3y = Y[i2] + H[i2][j2] * (Y[i2 + 1] - Y[i2]);
              i3 = i2;
              j3 = j2;
              H[i3][j3] = -2;
              isS = false;
          }
          else if (H[i2][j2] === -2 && H[i2][j2 + 1] !== -2) {
              a3x = X[j2 + 1];
              a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2]);
              i3 = i2;
              j3 = j2 + 1;
              H[i3][j3] = -2;
              isS = false;
          }
          else if (S[i2 + 1][j2] !== -2) {
              a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2]);
              a3y = Y[i2 + 1];
              i3 = i2 + 1;
              j3 = j2;
              S[i3][j3] = -2;
              isS = true;
          }
          else {
              canTrace = false;
          }
      }
      else if (j1 < j2) {
          //---- Trace from left
          if (S[i2][j2] !== -2 && S[i2 + 1][j2] !== -2) {
              if (S[i2][j2] < S[i2 + 1][j2]) {
                  a3x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2]);
                  a3y = Y[i2];
                  i3 = i2;
                  j3 = j2;
                  S[i3][j3] = -2;
                  isS = true;
              }
              else {
                  a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2]);
                  a3y = Y[i2 + 1];
                  i3 = i2 + 1;
                  j3 = j2;
                  S[i3][j3] = -2;
                  isS = true;
              }
          }
          else if (S[i2][j2] !== -2 && S[i2 + 1][j2] === -2) {
              a3x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2]);
              a3y = Y[i2];
              i3 = i2;
              j3 = j2;
              S[i3][j3] = -2;
              isS = true;
          }
          else if (S[i2][j2] === -2 && S[i2 + 1][j2] !== -2) {
              a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2]);
              a3y = Y[i2 + 1];
              i3 = i2 + 1;
              j3 = j2;
              S[i3][j3] = -2;
              isS = true;
          }
          else if (H[i2][j2 + 1] !== -2) {
              a3x = X[j2 + 1];
              a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2]);
              i3 = i2;
              j3 = j2 + 1;
              H[i3][j3] = -2;
              isS = false;
          }
          else {
              canTrace = false;
          }
      }
      else if (X[j2] < a2x) {
          //---- Trace from top
          if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] !== -2) {
              if (H[i2 - 1][j2] > H[i2 - 1][j2 + 1]) {
                  //---- < changed to >
                  a3x = X[j2];
                  a3y = Y[i2 - 1] + H[i2 - 1][j2] * (Y[i2] - Y[i2 - 1]);
                  i3 = i2 - 1;
                  j3 = j2;
                  H[i3][j3] = -2;
                  isS = false;
              }
              else {
                  a3x = X[j2 + 1];
                  a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * (Y[i2] - Y[i2 - 1]);
                  i3 = i2 - 1;
                  j3 = j2 + 1;
                  H[i3][j3] = -2;
                  isS = false;
              }
          }
          else if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] === -2) {
              a3x = X[j2];
              a3y = Y[i2 - 1] + H[i2 - 1][j2] * (Y[i2] - Y[i2 - 1]);
              i3 = i2 - 1;
              j3 = j2;
              H[i3][j3] = -2;
              isS = false;
          }
          else if (H[i2 - 1][j2] === -2 && H[i2 - 1][j2 + 1] !== -2) {
              a3x = X[j2 + 1];
              a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * (Y[i2] - Y[i2 - 1]);
              i3 = i2 - 1;
              j3 = j2 + 1;
              H[i3][j3] = -2;
              isS = false;
          }
          else if (S[i2 - 1][j2] !== -2) {
              a3x = X[j2] + S[i2 - 1][j2] * (X[j2 + 1] - X[j2]);
              a3y = Y[i2 - 1];
              i3 = i2 - 1;
              j3 = j2;
              S[i3][j3] = -2;
              isS = true;
          }
          else {
              canTrace = false;
          }
      } //---- Trace from right
      else {
          if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] !== -2) {
              if (S[i2 + 1][j2 - 1] > S[i2][j2 - 1]) {
                  //---- < changed to >
                  a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * (X[j2] - X[j2 - 1]);
                  a3y = Y[i2 + 1];
                  i3 = i2 + 1;
                  j3 = j2 - 1;
                  S[i3][j3] = -2;
                  isS = true;
              }
              else {
                  a3x = X[j2 - 1] + S[i2][j2 - 1] * (X[j2] - X[j2 - 1]);
                  a3y = Y[i2];
                  i3 = i2;
                  j3 = j2 - 1;
                  S[i3][j3] = -2;
                  isS = true;
              }
          }
          else if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] === -2) {
              a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * (X[j2] - X[j2 - 1]);
              a3y = Y[i2 + 1];
              i3 = i2 + 1;
              j3 = j2 - 1;
              S[i3][j3] = -2;
              isS = true;
          }
          else if (S[i2 + 1][j2 - 1] === -2 && S[i2][j2 - 1] !== -2) {
              a3x = X[j2 - 1] + S[i2][j2 - 1] * (X[j2] - X[j2 - 1]);
              a3y = Y[i2];
              i3 = i2;
              j3 = j2 - 1;
              S[i3][j3] = -2;
              isS = true;
          }
          else if (H[i2][j2 - 1] !== -2) {
              a3x = X[j2 - 1];
              a3y = Y[i2] + H[i2][j2 - 1] * (Y[i2 + 1] - Y[i2]);
              i3 = i2;
              j3 = j2 - 1;
              H[i3][j3] = -2;
              isS = false;
          }
          else {
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
      var _a;
      var aPolygonList = [];
      var aLineList;
      var aLine;
      var aPoint;
      var aPolygon;
      var aBound;
      var i;
      var j;
      aLineList = [];
      aLineList.push.apply(aLineList, LineList);
      //---- Tracing border polygon
      var aPList;
      var newPList;
      var bP;
      var bP1;
      var timesArray = [];
      timesArray.length = borderList.length - 1;
      for (i = 0; i < timesArray.length; i++) {
          timesArray[i] = 0;
      }
      var pIdx;
      var pNum;
      var vNum;
      var aValue = 0;
      var bValue = 0;
      var cValue = 0;
      var lineBorderList = [];
      var borderIdx1;
      var borderIdx2;
      var innerIdx;
      pNum = borderList.length;
      for (i = 0; i < pNum; i++) {
          if (borderList[i].id === -1) {
              continue;
          }
          pIdx = i;
          lineBorderList.push(borderList[i]);
          var sameBorderIdx = false; //The two end points of the contour line are on same inner border
          //---- Clockwise traceing
          if (timesArray[pIdx] < 2) {
              bP = borderList[pIdx];
              innerIdx = bP.bInnerIdx;
              aPList = [];
              var bIdxList = [];
              aPList.push(bP.point);
              bIdxList.push(pIdx);
              borderIdx1 = bP.borderIdx;
              borderIdx2 = borderIdx1;
              pIdx += 1;
              innerIdx += 1;
              //If pIdx = pNum Then
              //    pIdx = 0
              //End If
              if (innerIdx === pNums[borderIdx1] - 1) {
                  pIdx = pIdx - (pNums[borderIdx1] - 1);
              }
              vNum = 0;
              do {
                  bP = borderList[pIdx];
                  //---- Not endpoint of contour
                  if (bP.id === -1) {
                      if (timesArray[pIdx] === 1) {
                          break;
                      }
                      cValue = bP.value;
                      aPList.push(bP.point);
                      timesArray[pIdx] += 1;
                      bIdxList.push(pIdx);
                      //---- endpoint of contour
                  }
                  else {
                      if (timesArray[pIdx] === 2) {
                          break;
                      }
                      timesArray[pIdx] += 1;
                      bIdxList.push(pIdx);
                      aLine = aLineList[bP.id];
                      //---- Set high and low value of the polygon
                      if (vNum === 0) {
                          aValue = aLine.value;
                          bValue = aLine.value;
                          vNum += 1;
                      }
                      else if (aValue === bValue) {
                          if (aLine.value > aValue) {
                              bValue = aLine.value;
                          }
                          else if (aLine.value < aValue) {
                              aValue = aLine.value;
                          }
                          vNum += 1;
                      }
                      newPList = [];
                      newPList.push.apply(newPList, aLine.pointList);
                      aPoint = newPList[0];
                      //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
                      //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Not start point
                      //---- Not start point
                      if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
                          newPList.reverse();
                      }
                      aPList.push.apply(aPList, newPList);
                      //---- Find corresponding border point
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
                  //---- Return to start point, tracing finish
                  if (pIdx === i) {
                      if (aPList.length > 0) {
                          if (sameBorderIdx) {
                              var isTooBig = false;
                              var baseNum = 0;
                              for (var idx = 0; idx < bP.borderIdx; idx++) {
                                  baseNum += pNums[idx];
                              }
                              var sIdx = baseNum;
                              var eIdx = baseNum + pNums[bP.borderIdx];
                              var theIdx = sIdx;
                              for (var idx = sIdx; idx < eIdx; idx++) {
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
                          aPolygon.outLine.type = 'Border';
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
                  //if (pIdx === pNum)
                  //    pIdx = 0;
                  if (innerIdx === pNums[borderIdx1] - 1) {
                      pIdx = pIdx - (pNums[borderIdx1] - 1);
                      innerIdx = 0;
                  }
              } while (true);
          }
          sameBorderIdx = false;
          //---- Anticlockwise traceing
          pIdx = i;
          if (timesArray[pIdx] < 2) {
              aPList = [];
              var bIdxList = [];
              bP = borderList[pIdx];
              innerIdx = bP.bInnerIdx;
              aPList.push(bP.point);
              bIdxList.push(pIdx);
              borderIdx1 = bP.borderIdx;
              borderIdx2 = borderIdx1;
              pIdx += -1;
              innerIdx += -1;
              //If pIdx = -1 Then
              //    pIdx = pNum - 1
              //End If
              if (innerIdx === -1) {
                  pIdx = pIdx + (pNums[borderIdx1] - 1);
              }
              vNum = 0;
              do {
                  bP = borderList[pIdx];
                  //---- Not endpoint of contour
                  if (bP.id === -1) {
                      if (timesArray[pIdx] === 1) {
                          break;
                      }
                      cValue = bP.value;
                      aPList.push(bP.point);
                      bIdxList.push(pIdx);
                      timesArray[pIdx] += 1;
                      //---- endpoint of contour
                  }
                  else {
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
                      }
                      else if (aValue === bValue) {
                          if (aLine.value > aValue) {
                              bValue = aLine.value;
                          }
                          else if (aLine.value < aValue) {
                              aValue = aLine.value;
                          }
                          vNum += 1;
                      }
                      newPList = [];
                      newPList.push.apply(newPList, aLine.pointList);
                      aPoint = newPList[0];
                      //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
                      //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
                      //---- Start point
                      if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
                          newPList.reverse();
                      }
                      aPList.push.apply(aPList, newPList);
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
                              var isTooBig = false;
                              var baseNum = 0;
                              for (var idx = 0; idx < bP.borderIdx; idx++) {
                                  baseNum += pNums[idx];
                              }
                              var sIdx = baseNum;
                              var eIdx = baseNum + pNums[bP.borderIdx];
                              var theIdx = sIdx;
                              for (var idx = sIdx; idx < eIdx; idx++) {
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
                          aPolygon.outLine.type = 'Border';
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
                  //If pIdx = -1 Then
                  //    pIdx = pNum - 1
                  //End If
                  if (innerIdx === -1) {
                      pIdx = pIdx + pNums[borderIdx1];
                      innerIdx = pNums[borderIdx1] - 1;
                  }
              } while (true);
          }
      }
      //---- tracing close polygons
      var cPolygonlist = [];
      var isInserted;
      for (i = 0; i < aLineList.length; i++) {
          aLine = aLineList[i];
          if (aLine.type === 'Close') {
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
              //---- Sort from big to small
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
      //---- Juge isHighCenter for border polygons
      if (aPolygonList.length === 0) {
          aLine = new PolyLine();
          aLine.type = 'Border';
          aLine.value = contour[0];
          aLine.pointList = [];
          (_a = aLine.pointList).push.apply(_a, aBorder.lineList[0].pointList);
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
      //---- Add close polygons to form total polygons list
      aPolygonList.push.apply(aPolygonList, cPolygonlist);
      //---- Juge siHighCenter for close polygons
      var cBound1;
      var cBound2;
      var polygonNum = aPolygonList.length;
      var bPolygon;
      for (i = polygonNum - 1; i >= 0; i += -1) {
          aPolygon = aPolygonList[i];
          if (aPolygon.outLine.type === 'Close') {
              cBound1 = aPolygon.extent;
              aValue = aPolygon.lowValue;
              aPoint = aPolygon.outLine.pointList[0];
              for (j = i - 1; j >= 0; j += -1) {
                  bPolygon = aPolygonList[j];
                  cBound2 = bPolygon.extent;
                  bValue = bPolygon.lowValue;
                  newPList = [];
                  newPList.push.apply(newPList, bPolygon.outLine.pointList);
                  if (pointInPolygonByPList(newPList, aPoint)) {
                      if (cBound1.xMin > cBound2.xMin &&
                          cBound1.yMin > cBound2.yMin &&
                          cBound1.xMax < cBound2.xMax &&
                          cBound1.yMax < cBound2.yMax) {
                          if (aValue < bValue) {
                              aPolygon.isHighCenter = false;
                          }
                          else if (aValue === bValue) {
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
      var a, b, c, d, val1, val2;
      var dx, dy;
      var xNum = X.length;
      var yNum = Y.length;
      var deltX = X[1] - X[0];
      var deltY = Y[1] - Y[0];
      var ii = iijj[0];
      var jj = iijj[1];
      //Interpolation the U/V displacement components to the point
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
      //Tracing forward by U/V displacement components
      if (isForward) {
          aPoint.x += dx;
          aPoint.y += dy;
      }
      else {
          aPoint.x -= dx;
          aPoint.y -= dy;
      }
      //Find the grid box that the point is located
      if (!(aPoint.x >= X[jj] && aPoint.x <= X[jj + 1] && aPoint.y >= Y[ii] && aPoint.y <= Y[ii + 1])) {
          if (aPoint.x < X[0] ||
              aPoint.x > X[X.length - 1] ||
              aPoint.y < Y[0] ||
              aPoint.y > Y[Y.length - 1]) {
              return false;
          }
          //Get the grid box of the point located
          for (var ti = ii - 2; ti < ii + 3; ti++) {
              if (ti >= 0 && ti < yNum) {
                  if (aPoint.y >= Y[ti] && aPoint.y <= Y[ti + 1]) {
                      ii = ti;
                      for (var tj = jj - 2; tj < jj + 3; tj++) {
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

  var Contour = /** @class */ (function () {
      function Contour(s0, xs, ys, undefData) {
          this._borders = [];
          this._s0 = s0; //
          this._m = s0.length; // y
          this._n = s0[0].length; // x
          this._xs = xs;
          this._ys = ys;
          this._undefData = undefData;
          this._s1 = this._tracingDataFlag();
          this._borders = this._tracingBorders();
      }
      /**
       * tracing data flag array of the grid data.
       */
      Contour.prototype._tracingDataFlag = function () {
          var s1 = [];
          var _a = this, _s0 = _a._s0, _m = _a._m, _n = _a._n, _undefData = _a._undefData;
          // Generate data flag array
          // 1. 0 with undefine data, 1 with data
          for (var i = 0; i < _m; i++) {
              s1[i] = [];
              for (var j = 0; j < _n; j++) {
                  s1[i][j] = doubleEquals(_s0[i][j], _undefData) ? 0 : 1;
              }
          }
          // 2. data flag array: border points are 1, undefine points are 0, inside data points are 2
          for (var i = 1; i < _m - 1; i++) {
              for (var j = 1; j < _n - 1; j++) {
                  if (s1[i][j] === 1) {
                      // l - Left; r - Right; b - Bottom; t - Top;
                      // lb - LeftBottom; rb - RightBottom; lt - LeftTop; rt - RightTop
                      var l = s1[i][j - 1];
                      var r = s1[i][j + 1];
                      var b = s1[i - 1][j];
                      var t = s1[i + 1][j];
                      var lb = s1[i - 1][j - 1];
                      var rb = s1[i - 1][j + 1];
                      var lt = s1[i + 1][j - 1];
                      var rt = s1[i + 1][j + 1];
                      if (l > 0 && r > 0 && b > 0 && t > 0 && lb > 0 && rb > 0 && lt > 0 && rt > 0) {
                          // inside data point
                          s1[i][j] = 2;
                      }
                      if (l + r + b + t + lb + rb + lt + rt <= 2) {
                          // data point, but not more than 3 continued data points together.
                          // so they can't be traced as a border (at least 4 points together).
                          s1[i][j] = 0;
                      }
                  }
              }
          }
          // 3. remove isolated data points (up, down, left and right points are all undefine data).
          var isContinue;
          while (true) {
              isContinue = false;
              for (var i = 1; i < _m - 1; i++) {
                  for (var j = 1; j < _n - 1; j++) {
                      if (s1[i][j] === 1) {
                          var l = s1[i][j - 1];
                          var r = s1[i][j + 1];
                          var b = s1[i - 1][j];
                          var t = s1[i + 1][j];
                          var lb = s1[i - 1][j - 1];
                          var rb = s1[i - 1][j + 1];
                          var lt = s1[i + 1][j - 1];
                          var rt = s1[i + 1][j + 1];
                          if ((l === 0 && r === 0) || (b === 0 && t === 0)) {
                              // up, down, left and right points are all undefine data
                              s1[i][j] = 0;
                              isContinue = true;
                          }
                          if ((lt === 0 && r === 0 && b === 0) ||
                              (rt === 0 && l === 0 && b === 0) ||
                              (lb === 0 && r === 0 && t === 0) ||
                              (rb === 0 && l === 0 && t === 0)) {
                              s1[i][j] = 0;
                              isContinue = true;
                          }
                      }
                  }
              }
              if (!isContinue) {
                  // untile no more isolated data point.
                  break;
              }
          }
          // 4. deal with grid data border points
          // top and bottom border points
          for (var j = 0; j < _n; j++) {
              if (s1[0][j] === 1) {
                  if (s1[1][j] === 0) {
                      // up point is undefine
                      s1[0][j] = 0;
                  }
                  else if (j === 0) {
                      if (s1[0][j + 1] === 0) {
                          s1[0][j] = 0;
                      }
                  }
                  else if (j === _n - 1) {
                      if (s1[0][_n - 2] === 0) {
                          s1[0][j] = 0;
                      }
                  }
                  else if (s1[0][j - 1] === 0 && s1[0][j + 1] === 0) {
                      s1[0][j] = 0;
                  }
              }
              if (s1[_m - 1][j] === 1) {
                  if (s1[_m - 2][j] === 0) {
                      // down point is undefine
                      s1[_m - 1][j] = 0;
                  }
                  else if (j === 0) {
                      if (s1[_m - 1][j + 1] === 0) {
                          s1[_m - 1][j] = 0;
                      }
                  }
                  else if (j === _n - 1) {
                      if (s1[_m - 1][_n - 2] === 0) {
                          s1[_m - 1][j] = 0;
                      }
                  }
                  else if (s1[_m - 1][j - 1] === 0 && s1[_m - 1][j + 1] === 0) {
                      s1[_m - 1][j] = 0;
                  }
              }
          }
          // left and right border points
          for (var i = 0; i < _m; i++) {
              if (s1[i][0] === 1) {
                  if (s1[i][1] === 0) {
                      // right point is undefine
                      s1[i][0] = 0;
                  }
                  else if (i === 0) {
                      if (s1[i + 1][0] === 0) {
                          s1[i][0] = 0;
                      }
                  }
                  else if (i === _m - 1) {
                      if (s1[_m - 2][0] === 0) {
                          s1[i][0] = 0;
                      }
                  }
                  else if (s1[i - 1][0] === 0 && s1[i + 1][0] === 0) {
                      s1[i][0] = 0;
                  }
              }
              if (s1[i][_n - 1] === 1) {
                  if (s1[i][_n - 2] === 0) {
                      // left point is undefine
                      s1[i][_n - 1] = 0;
                  }
                  else if (i === 0) {
                      if (s1[i + 1][_n - 1] === 0) {
                          s1[i][_n - 1] = 0;
                      }
                  }
                  else if (i === _m - 1) {
                      if (s1[_m - 2][_n - 1] === 0) {
                          s1[i][_n - 1] = 0;
                      }
                  }
                  else if (s1[i - 1][_n - 1] === 0 && s1[i + 1][_n - 1] === 0) {
                      s1[i][_n - 1] = 0;
                  }
              }
          }
          return s1;
      };
      /**
       * tracing contour borders of the grid data with data flag.
       */
      Contour.prototype._tracingBorders = function () {
          var _a = this, _s1 = _a._s1, _m = _a._m, _n = _a._n, _xs = _a._xs, _ys = _a._ys;
          var borderLines = [];
          // generate s2 from s1, add border to s2 with undefine data.
          var s2 = [];
          for (var i = 0; i < _m + 2; i++) {
              s2[i] = [];
              for (var j = 0; j < _n + 2; j++) {
                  if (i === 0 || i === _m + 1) {
                      // bottom or top border
                      s2[i][j] = 0;
                  }
                  else if (j === 0 || j === _n + 1) {
                      // left or right border
                      s2[i][j] = 0;
                  }
                  else {
                      s2[i][j] = _s1[i - 1][j - 1];
                  }
              }
          }
          // using times number of each point during chacing process.
          var uNum = [];
          for (var i = 0; i < _m + 2; i++) {
              uNum[i] = [];
              for (var j = 0; j < _n + 2; j++) {
                  if (s2[i][j] === 1) {
                      var l = s2[i][j - 1];
                      var r = s2[i][j + 1];
                      var b = s2[i - 1][j];
                      var t = s2[i + 1][j];
                      var lb = s2[i - 1][j - 1];
                      var rb = s2[i - 1][j + 1];
                      var lt = s2[i + 1][j - 1];
                      var rt = s2[i + 1][j + 1];
                      // cross point with two boder lines, will be used twice.
                      if (l === 1 &&
                          r === 1 &&
                          b === 1 &&
                          t === 1 &&
                          ((lb === 0 && rt === 0) || (rb === 0 && lt === 0))) {
                          uNum[i][j] = 2;
                      }
                      else {
                          uNum[i][j] = 1;
                      }
                  }
                  else {
                      uNum[i][j] = 0;
                  }
              }
          }
          // tracing borderlines
          for (var i = 1; i < _m + 1; i++) {
              for (var j = 1; j < _n + 1; j++) {
                  if (s2[i][j] === 1) {
                      // tracing border from any border point
                      var pointList = [];
                      var ijPList = [];
                      pointList.push(new PointD(_xs[j - 1], _ys[i - 1]));
                      ijPList.push(new IJPoint(i - 1, j - 1));
                      var i3 = 0;
                      var j3 = 0;
                      var i2 = i;
                      var j2 = j;
                      var i1 = i2;
                      var j1 = -1; // Trace from left firstly
                      while (true) {
                          var ij3 = [];
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
                                  s2[i3][j3] = 3; //Used border point
                              }
                          }
                          else {
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
                          s2[i][j] = 3; //Used border point
                      } //uNum[i][j] = uNum[i][j] - 1;
                      if (pointList.length > 1) {
                          var aBLine = new BorderLine();
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
          // Form borders
          var borders = [];
          // Sort borderlines with area from small to big.
          // For inside border line analysis
          for (var i = 1; i < borderLines.length; i++) {
              var aLine = borderLines[i];
              for (var j = 0; j < i; j++) {
                  var bLine = borderLines[i];
                  if (aLine.area > bLine.area) {
                      borderLines.splice(i, 1);
                      borderLines.splice(j, 0, aLine);
                      break;
                  }
              }
          }
          var lineList;
          if (borderLines.length === 1) {
              // Only one boder line
              var aLine = borderLines[0];
              if (!isClockwise(aLine.pointList)) {
                  aLine.pointList = aLine.pointList.reverse();
                  aLine.ijPointList.reverse();
              }
              aLine.isClockwise = true;
              lineList = [];
              lineList.push(aLine);
              var aBorder = new Border();
              aBorder.lineList = lineList;
              borders.push(aBorder);
          }
          else {
              // muti border lines
              for (var i = 0; i < borderLines.length; i++) {
                  if (i === borderLines.length) {
                      break;
                  }
                  var aLine = borderLines[i];
                  if (!isClockwise(aLine.pointList)) {
                      aLine.pointList.reverse();
                      aLine.ijPointList.reverse();
                  }
                  aLine.isClockwise = true;
                  lineList = [];
                  lineList.push(aLine);
                  // Try to find the boder lines are inside of aLine.
                  for (var j = i + 1; j < borderLines.length; j++) {
                      if (j === borderLines.length) {
                          break;
                      }
                      var bLine = borderLines[i];
                      if (bLine.extent.xMin > aLine.extent.xMin &&
                          bLine.extent.xMax < aLine.extent.xMax &&
                          bLine.extent.yMin > aLine.extent.yMin &&
                          bLine.extent.yMax < aLine.extent.yMax) {
                          var aPoint = bLine.pointList[0];
                          if (pointInPolygonByPList(aLine.pointList, aPoint)) {
                              // bLine is inside of aLine
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
                  var aBorder = new Border();
                  aBorder.lineList = lineList;
                  borders.push(aBorder);
              }
          }
          return borders;
      };
      /**
       * Tracing contour lines from the grid data with undefine data
       *
       * @param contour contour value array
       * @return contour line list
       */
      Contour.prototype.tracingContourLines = function (contour) {
          var _a = this, _s0 = _a._s0, _s1 = _a._s1, _xs = _a._xs, _ys = _a._ys, _m = _a._m, _n = _a._n, _borders = _a._borders, _undefData = _a._undefData;
          var contourLineList = [];
          var cLineList;
          // Add a small value to aviod the contour point as same as data point
          var dShift = contour[0] * 0.00001;
          if (dShift === 0) {
              dShift = 0.00001;
          }
          for (var i = 0; i < _m; i++) {
              for (var j = 0; j < _n; j++) {
                  if (!doubleEquals(_s0[i][j], _undefData)) {
                      _s0[i][j] = _s0[i][j] + dShift;
                  }
              }
          }
          // Define if H S are border
          var SB = [];
          var HB = []; // Which border and trace direction
          SB[0] = [];
          SB[1] = [];
          HB[0] = [];
          HB[1] = [];
          for (var i = 0; i < _m; i++) {
              SB[0][i] = [];
              SB[1][i] = [];
              HB[0][i] = [];
              HB[1][i] = [];
              for (var j = 0; j < _n; j++) {
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
          var k, si, sj;
          var aijP, bijP;
          for (var i = 0; i < _borders.length; i++) {
              var aBorder = _borders[i];
              for (var j = 0; j < aBorder.getLineNum(); j++) {
                  var aBLine = aBorder.lineList[j];
                  var ijPList = aBLine.ijPointList;
                  for (k = 0; k < ijPList.length - 1; k++) {
                      aijP = ijPList[k];
                      bijP = ijPList[k + 1];
                      if (aijP.i === bijP.i) {
                          si = aijP.i;
                          sj = Math.min(aijP.j, bijP.j);
                          SB[0][si][sj] = i;
                          if (bijP.j > aijP.j) {
                              // Trace from top
                              SB[1][si][sj] = 1;
                          }
                          else {
                              // Trace from bottom
                              SB[1][si][sj] = 0;
                          }
                      }
                      else {
                          sj = aijP.j;
                          si = Math.min(aijP.i, bijP.i);
                          HB[0][si][sj] = i;
                          if (bijP.i > aijP.i) {
                              // Trace from left
                              HB[1][si][sj] = 0;
                          }
                          else {
                              // Trace from right
                              HB[1][si][sj] = 1;
                          }
                      }
                  }
              }
          }
          //---- Define horizontal and vertical arrays with the position of the tracing value, -2 means no tracing point.
          var S = [];
          var H = [];
          var w; //---- Tracing value
          var c;
          //ArrayList _endPointList = new ArrayList();    //---- Contour line end points for insert to border
          for (c = 0; c < contour.length; c++) {
              w = contour[c];
              for (var i = 0; i < _m; i++) {
                  S[i] = [];
                  H[i] = [];
                  for (var j = 0; j < _n; j++) {
                      if (j < _n - 1) {
                          if (_s1[i][j] !== 0 && _s1[i][j + 1] !== 0) {
                              if ((_s0[i][j] - w) * (_s0[i][j + 1] - w) < 0) {
                                  //---- Has tracing value
                                  S[i][j] = (w - _s0[i][j]) / (_s0[i][j + 1] - _s0[i][j]);
                              }
                              else {
                                  S[i][j] = -2;
                              }
                          }
                          else {
                              S[i][j] = -2;
                          }
                      }
                      if (i < _m - 1) {
                          if (_s1[i][j] !== 0 && _s1[i + 1][j] !== 0) {
                              if ((_s0[i][j] - w) * (_s0[i + 1][j] - w) < 0) {
                                  //---- Has tracing value
                                  H[i][j] = (w - _s0[i][j]) / (_s0[i + 1][j] - _s0[i][j]);
                              }
                              else {
                                  H[i][j] = -2;
                              }
                          }
                          else {
                              H[i][j] = -2;
                          }
                      }
                  }
              }
              cLineList = Contour.isoline_UndefData(_s0, _xs, _ys, w, S, H, SB, HB, contourLineList.length);
              for (var _i = 0, cLineList_1 = cLineList; _i < cLineList_1.length; _i++) {
                  var ln = cLineList_1[_i];
                  contourLineList.push(ln);
              }
          }
          //---- Set border index for close contours
          for (var i = 0; i < _borders.length; i++) {
              var aBorder = _borders[i];
              var aBLine = aBorder.lineList[0];
              for (var j = 0; j < contourLineList.length; j++) {
                  var aLine = contourLineList[j];
                  if (aLine.type === 'Close') {
                      var aPoint = aLine.pointList[0];
                      if (pointInPolygonByPList(aBLine.pointList, aPoint)) {
                          aLine.borderIdx = i;
                      }
                  }
                  contourLineList.splice(j, 1);
                  contourLineList.splice(j, 0, aLine);
              }
          }
          return contourLineList;
      };
      /**
       * Tracing polygons from contour lines and borders
       *
       * @param cLineList contour lines
       * @param contour contour values
       */
      Contour.prototype.tracingPolygons = function (cLineList, contour) {
          var S0 = this._s0;
          var borderList = this._borders;
          var aPolygonList = [];
          var newPolygonList = [];
          var newBPList;
          var bPList = [];
          var PList;
          var aBorder;
          var aBLine;
          var aPoint;
          var aBPoint;
          var i, j;
          var lineList = [];
          var aBorderList = [];
          var aLine;
          var aPolygon;
          var aijP;
          var aValue = 0;
          var pNums;
          //Borders loop
          for (i = 0; i < borderList.length; i++) {
              aBorderList = [];
              bPList = [];
              lineList = [];
              aPolygonList = [];
              aBorder = borderList[i];
              aBLine = aBorder.lineList[0];
              PList = aBLine.pointList;
              if (!isClockwise(PList)) {
                  //Make sure the point list is clockwise
                  PList.reverse();
              }
              if (aBorder.getLineNum() === 1) {
                  //The border has just one line
                  //Construct border point list
                  for (j = 0; j < PList.length; j++) {
                      aPoint = PList[j];
                      aBPoint = new BorderPoint();
                      aBPoint.id = -1;
                      aBPoint.point = aPoint;
                      aBPoint.value = S0[aBLine.ijPointList[j].i][aBLine.ijPointList[j].j];
                      aBorderList.push(aBPoint);
                  }
                  //Find the contour lines of this border
                  for (j = 0; j < cLineList.length; j++) {
                      aLine = cLineList[j];
                      if (aLine.borderIdx === i) {
                          lineList.push(aLine); //Construct contour line list
                          //Construct border point list of the contour line
                          if (aLine.type === 'Border') {
                              //The contour line with the start/end point on the border
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
                      //No contour lines in this border, the polygon is the border
                      //Judge the value of the polygon
                      aijP = aBLine.ijPointList[0];
                      aPolygon = new Polygon();
                      if (S0[aijP.i][aijP.j] < contour[0]) {
                          aValue = contour[0];
                          aPolygon.isHighCenter = false;
                      }
                      else {
                          for (j = contour.length - 1; j >= 0; j--) {
                              if (S0[aijP.i][aijP.j] > contour[j]) {
                                  aValue = contour[j];
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
                          aPolygon.outLine.type = 'Border';
                          aPolygon.outLine.value = aValue;
                          aPolygon.outLine.borderIdx = i;
                          aPolygon.outLine.pointList = PList;
                          aPolygon.holeLines = [];
                          aPolygonList.push(aPolygon);
                      }
                  } //Has contour lines in this border
                  else {
                      //Insert the border points of the contour lines to the border point list of the border
                      if (bPList.length > 0) {
                          newBPList = Contour.insertPoint2Border(bPList, aBorderList);
                      }
                      else {
                          newBPList = aBorderList;
                      }
                      //aPolygonList = TracingPolygons(lineList, newBPList, aBound, contour);
                      aPolygonList = Contour.tracingPolygons_Line_Border(lineList, newBPList);
                  }
                  aPolygonList = Contour.addPolygonHoles(aPolygonList);
              } //---- The border has holes
              else {
                  aBLine = aBorder.lineList[0];
                  //Find the contour lines of this border
                  for (j = 0; j < cLineList.length; j++) {
                      aLine = cLineList[j];
                      if (aLine.borderIdx === i) {
                          lineList.push(aLine);
                          if (aLine.type === 'Border') {
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
                      //No contour lines in this border, the polygon is the border and the holes
                      aijP = aBLine.ijPointList[0];
                      aPolygon = new Polygon();
                      if (S0[aijP.i][aijP.j] < contour[0]) {
                          aValue = contour[0];
                          aPolygon.isHighCenter = false;
                      }
                      else {
                          for (j = contour.length - 1; j >= 0; j--) {
                              if (S0[aijP.i][aijP.j] > contour[j]) {
                                  aValue = contour[j];
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
                          aPolygon.outLine.type = 'Border';
                          aPolygon.outLine.value = aValue;
                          aPolygon.outLine.borderIdx = i;
                          aPolygon.outLine.pointList = PList;
                          aPolygon.holeLines = [];
                          aPolygonList.push(aPolygon);
                      }
                  }
                  else {
                      pNums = [];
                      pNums.length = aBorder.getLineNum();
                      newBPList = Contour.insertPoint2Border_Ring(S0, bPList, aBorder, pNums);
                      aPolygonList = tracingPolygons_Ring(lineList, newBPList, aBorder, contour, pNums);
                      //aPolygonList = TracingPolygons(lineList, newBPList, contour);
                      //Sort polygons by area
                      var sortList = [];
                      while (aPolygonList.length > 0) {
                          var isInsert = false;
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
                  var holeList = [];
                  for (j = 0; j < aBorder.getLineNum(); j++) {
                      //let tempList = [];
                      //for (let p of aBorder.lineList[j].pointList) {
                      //  tempList.push(p);
                      //}
                      holeList.push(aBorder.lineList[j].pointList);
                  }
                  if (holeList.length > 0) {
                      addHoles_Ring(aPolygonList, holeList);
                  }
                  aPolygonList = addPolygonHoles_Ring(aPolygonList);
              }
              newPolygonList.push.apply(newPolygonList, aPolygonList);
          }
          //newPolygonList = AddPolygonHoles(newPolygonList);
          for (var _i = 0, newPolygonList_1 = newPolygonList; _i < newPolygonList_1.length; _i++) {
              var nPolygon = newPolygonList_1[_i];
              if (!isClockwise(nPolygon.outLine.pointList)) {
                  nPolygon.outLine.pointList.reverse();
              }
          }
          return newPolygonList;
      };
      Contour.isoline_UndefData = function (S0, X, Y, W, S, H, SB, HB, lineNum) {
          var cLineList = [];
          var m, n, i, j;
          m = S0.length;
          n = S0[0].length;
          var i1, i2, j1, j2, i3 = 0, j3 = 0;
          var a2x, a2y, a3x = 0, a3y = 0, sx, sy;
          var aPoint;
          var aLine;
          var pList;
          var isS = true;
          var aEndPoint = new EndPoint();
          //---- Tracing from border
          for (i = 0; i < m; i++) {
              for (j = 0; j < n; j++) {
                  if (j < n - 1) {
                      if (SB[0][i][j] > -1) {
                          //---- Border
                          if (S[i][j] !== -2) {
                              pList = [];
                              i2 = i;
                              j2 = j;
                              a2x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2]); //---- x of first point
                              a2y = Y[i2]; //---- y of first point
                              if (SB[1][i][j] === 0) {
                                  //---- Bottom border
                                  i1 = -1;
                                  aEndPoint.sPoint.x = X[j + 1];
                                  aEndPoint.sPoint.y = Y[i];
                              }
                              else {
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
                              Contour._endPointList.push(aEndPoint);
                              aLine = new PolyLine();
                              aLine.type = 'Border';
                              aLine.borderIdx = SB[0][i][j];
                              while (true) {
                                  var ij3 = [i3, j3];
                                  var a3xy = [a3x, a3y];
                                  var IsS = [isS];
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
                                              }
                                              else {
                                                  aEndPoint.sPoint.x = X[j3];
                                                  aEndPoint.sPoint.y = Y[i3];
                                              }
                                              break;
                                          }
                                      }
                                      else if (HB[0][i3][j3] > -1) {
                                          if (HB[1][i3][j3] === 0) {
                                              aEndPoint.sPoint.x = X[j3];
                                              aEndPoint.sPoint.y = Y[i3];
                                          }
                                          else {
                                              aEndPoint.sPoint.x = X[j3];
                                              aEndPoint.sPoint.y = Y[i3 + 1];
                                          }
                                          break;
                                      }
                                      a2x = a3x;
                                      //a2y = a3y;
                                      i1 = i2;
                                      j1 = j2;
                                      i2 = i3;
                                      j2 = j3;
                                  }
                                  else {
                                      aLine.type = 'Error';
                                      break;
                                  }
                              }
                              S[i][j] = -2;
                              if (pList.length > 1 && !(aLine.type === 'Error')) {
                                  aEndPoint.point = aPoint;
                                  Contour._endPointList.push(aEndPoint);
                                  aLine.value = W;
                                  aLine.pointList = pList;
                                  cLineList.push(aLine);
                              }
                              else {
                                  Contour._endPointList.pop();
                              }
                          }
                      }
                  }
                  if (i < m - 1) {
                      if (HB[0][i][j] > -1) {
                          //---- Border
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
                              }
                              else {
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
                              Contour._endPointList.push(aEndPoint);
                              aLine = new PolyLine();
                              aLine.type = 'Border';
                              aLine.borderIdx = HB[0][i][j];
                              while (true) {
                                  var ij3 = [i3, j3];
                                  var a3xy = [a3x, a3y];
                                  var IsS = [isS];
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
                                              }
                                              else {
                                                  aEndPoint.sPoint.x = X[j3];
                                                  aEndPoint.sPoint.y = Y[i3];
                                              }
                                              break;
                                          }
                                      }
                                      else if (HB[0][i3][j3] > -1) {
                                          if (HB[1][i3][j3] === 0) {
                                              aEndPoint.sPoint.x = X[j3];
                                              aEndPoint.sPoint.y = Y[i3];
                                          }
                                          else {
                                              aEndPoint.sPoint.x = X[j3];
                                              aEndPoint.sPoint.y = Y[i3 + 1];
                                          }
                                          break;
                                      }
                                      a2x = a3x;
                                      //a2y = a3y;
                                      i1 = i2;
                                      j1 = j2;
                                      i2 = i3;
                                      j2 = j3;
                                  }
                                  else {
                                      aLine.type = 'Error';
                                      break;
                                  }
                              }
                              H[i][j] = -2;
                              if (pList.length > 1 && !(aLine.type === 'Error')) {
                                  aEndPoint.point = aPoint;
                                  Contour._endPointList.push(aEndPoint);
                                  aLine.value = W;
                                  aLine.pointList = pList;
                                  cLineList.push(aLine);
                              }
                              else {
                                  Contour._endPointList.pop();
                              }
                          }
                      }
                  }
              }
          }
          //---- Clear border points
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
          //---- Tracing close lines
          for (i = 1; i < m - 2; i++) {
              for (j = 1; j < n - 1; j++) {
                  if (H[i][j] !== -2) {
                      var pointList = [];
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
                      aLine.type = 'Close';
                      while (true) {
                          var ij3 = [];
                          var a3xy = [];
                          var IsS = [];
                          if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
                              i3 = ij3[0];
                              j3 = ij3[1];
                              a3x = a3xy[0];
                              a3y = a3xy[1];
                              //isS = IsS[0];
                              aPoint = new PointD();
                              aPoint.x = a3x;
                              aPoint.y = a3y;
                              pointList.push(aPoint);
                              if (Math.abs(a3y - sy) < 0.000001 && Math.abs(a3x - sx) < 0.000001) {
                                  break;
                              }
                              a2x = a3x;
                              //a2y = a3y;
                              i1 = i2;
                              j1 = j2;
                              i2 = i3;
                              j2 = j3;
                              //If X[j2] < a2x && i2 = 0 )
                              //    aLine.type = "Error"
                              //    Exit Do
                              //End If
                          }
                          else {
                              aLine.type = 'Error';
                              break;
                          }
                      }
                      H[i][j] = -2;
                      if (pointList.length > 1 && !(aLine.type === 'Error')) {
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
                      var pointList = [];
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
                      aLine.type = 'Close';
                      while (true) {
                          var ij3 = [];
                          var a3xy = [];
                          var IsS = [];
                          if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
                              i3 = ij3[0];
                              j3 = ij3[1];
                              a3x = a3xy[0];
                              a3y = a3xy[1];
                              //isS = IsS[0];
                              aPoint = new PointD();
                              aPoint.x = a3x;
                              aPoint.y = a3y;
                              pointList.push(aPoint);
                              if (Math.abs(a3y - sy) < 0.000001 && Math.abs(a3x - sx) < 0.000001) {
                                  break;
                              }
                              a2x = a3x;
                              //a2y = a3y;
                              i1 = i2;
                              j1 = j2;
                              i2 = i3;
                              j2 = j3;
                          }
                          else {
                              aLine.type = 'Error';
                              break;
                          }
                      }
                      S[i][j] = -2;
                      if (pointList.length > 1 && !(aLine.type === 'Error')) {
                          aLine.value = W;
                          aLine.pointList = pointList;
                          cLineList.push(aLine);
                      }
                  }
              }
          }
          return cLineList;
      };
      Contour.tracingPolygons_Line_Border = function (LineList, borderList) {
          if (LineList.length === 0) {
              return [];
          }
          var aPolygonList = [];
          var aLineList = [];
          var aLine;
          var aPoint;
          var aPolygon;
          var aBound;
          var i, j;
          aLineList.push.apply(aLineList, LineList);
          //---- Tracing border polygon
          var aPList;
          var newPList;
          var bP;
          var timesArray = [];
          timesArray.length = borderList.length - 1;
          for (i = 0; i < timesArray.length; i++) {
              timesArray[i] = 0;
          }
          var pIdx, pNum, vNum, vvNum;
          var aValue = 0, bValue = 0, cValue = 0;
          var lineBorderList = [];
          pNum = borderList.length - 1;
          for (i = 0; i < pNum; i++) {
              if (borderList[i].id === -1) {
                  continue;
              }
              pIdx = i;
              aPList = [];
              lineBorderList.push(borderList[i]);
              //---- Clockwise traceing
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
                          //---- Not endpoint of contour
                          if (timesArray[pIdx] === 1) {
                              break;
                          }
                          cValue = bP.value;
                          vvNum += 1;
                          aPList.push(bP.point);
                          timesArray[pIdx] += +1;
                      } //---- endpoint of contour
                      else {
                          if (timesArray[pIdx] === 2) {
                              break;
                          }
                          timesArray[pIdx] += +1;
                          aLine = aLineList[bP.id];
                          if (vNum === 0) {
                              aValue = aLine.value;
                              bValue = aLine.value;
                              vNum += 1;
                          }
                          else {
                              if (aLine.value > aValue) {
                                  bValue = aLine.value;
                              }
                              else if (aLine.value < aValue) {
                                  aValue = aLine.value;
                              }
                              vNum += 1;
                          }
                          newPList = [];
                          newPList.push.apply(newPList, aLine.pointList);
                          aPoint = newPList[0];
                          //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
                          //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
                          if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
                              //---- Start point
                              newPList.reverse();
                          }
                          aPList.push.apply(aPList, newPList);
                          for (j = 0; j < borderList.length - 1; j++) {
                              if (j !== pIdx) {
                                  if (borderList[j].id === bP.id) {
                                      pIdx = j;
                                      timesArray[pIdx] += +1;
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
                              aPolygon.outLine.type = 'Border';
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
              //---- Anticlockwise traceing
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
                          //---- Not endpoint of contour
                          if (timesArray[pIdx] === 1) {
                              break;
                          }
                          cValue = bP.value;
                          vvNum += 1;
                          aPList.push(bP.point);
                          timesArray[pIdx] += +1;
                      } //---- endpoint of contour
                      else {
                          if (timesArray[pIdx] === 2) {
                              break;
                          }
                          timesArray[pIdx] += +1;
                          aLine = aLineList[bP.id];
                          if (vNum === 0) {
                              aValue = aLine.value;
                              bValue = aLine.value;
                              vNum += 1;
                          }
                          else {
                              if (aLine.value > aValue) {
                                  bValue = aLine.value;
                              }
                              else if (aLine.value < aValue) {
                                  aValue = aLine.value;
                              }
                              vNum += 1;
                          }
                          newPList = [];
                          newPList.push.apply(newPList, aLine.pointList);
                          aPoint = newPList[0];
                          //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
                          //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
                          if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
                              //---- Start point
                              newPList.reverse();
                          }
                          aPList.push.apply(aPList, newPList);
                          for (j = 0; j < borderList.length - 1; j++) {
                              if (j !== pIdx) {
                                  if (borderList[j].id === bP.id) {
                                      pIdx = j;
                                      timesArray[pIdx] += +1;
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
                              aPolygon.outLine.type = 'Border';
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
          //---- tracing close polygons
          var cPolygonlist = [];
          var isInserted;
          for (i = 0; i < aLineList.length; i++) {
              aLine = aLineList[i];
              if (aLine.type === 'Close' && aLine.pointList.length > 0) {
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
                  //---- Sort from big to small
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
          //---- Juge isHighCenter for border polygons
          aPolygonList = judgePolygonHighCenter(aPolygonList, cPolygonlist, aLineList, borderList);
          return aPolygonList;
      };
      Contour.addPolygonHoles = function (polygonList) {
          var holePolygons = [];
          var i, j;
          for (i = 0; i < polygonList.length; i++) {
              var aPolygon = polygonList[i];
              if (!aPolygon.isBorder) {
                  aPolygon.holeIndex = 1;
                  holePolygons.push(aPolygon);
              }
          }
          if (holePolygons.length === 0) {
              return polygonList;
          }
          else {
              var newPolygons = [];
              for (i = 1; i < holePolygons.length; i++) {
                  var aPolygon = holePolygons[i];
                  for (j = i - 1; j >= 0; j--) {
                      var bPolygon = holePolygons[j];
                      if (bPolygon.extent.include(aPolygon.extent)) {
                          if (pointInPolygonByPList(bPolygon.outLine.pointList, aPolygon.outLine.pointList[0])) {
                              aPolygon.holeIndex = bPolygon.holeIndex + 1;
                              bPolygon.addHole(aPolygon);
                              //holePolygons[i] = aPolygon;
                              //holePolygons[j] = bPolygon;
                              break;
                          }
                      }
                  }
              }
              var hole1Polygons = [];
              for (i = 0; i < holePolygons.length; i++) {
                  if (holePolygons[i].holeIndex === 1) {
                      hole1Polygons.push(holePolygons[i]);
                  }
              }
              for (i = 0; i < polygonList.length; i++) {
                  var aPolygon = polygonList[i];
                  if (aPolygon.isBorder === true) {
                      for (j = 0; j < hole1Polygons.length; j++) {
                          var bPolygon = hole1Polygons[j];
                          if (aPolygon.extent.include(bPolygon.extent)) {
                              if (pointInPolygonByPList(aPolygon.outLine.pointList, bPolygon.outLine.pointList[0])) {
                                  aPolygon.addHole(bPolygon);
                              }
                          }
                      }
                      newPolygons.push(aPolygon);
                  }
              }
              newPolygons.push.apply(newPolygons, holePolygons);
              return newPolygons;
          }
      };
      /**
       * Tracing stream lines
       *
       * @param U U component array
       * @param V V component array
       * @param X X coordinate array
       * @param Y Y coordinate array
       * @param UNDEF undefine data
       * @param density stream line density
       * @return streamlines
       */
      Contour.prototype.tracingStreamline = function (U, V, X, Y, UNDEF, density) {
          var streamLines = [];
          var xNum = U[1].length;
          var yNum = U.length;
          var Dx = [];
          var Dy = [];
          var deltX = X[1] - X[0];
          var deltY = Y[1] - Y[0];
          if (density === 0) {
              density = 1;
          }
          var radius = deltX / Math.pow(density, 2);
          //double smallRadius = deltX / (Math.pow(density, 10));
          var smallRadius = radius * 1.5;
          var i, j;
          //Normalize wind components
          for (i = 0; i < yNum; i++) {
              Dx[i] = [];
              Dy[i] = [];
              for (j = 0; j < xNum; j++) {
                  if (Math.abs(U[i][j] / UNDEF - 1) < 0.01) {
                      Dx[i][j] = 0.1;
                      Dy[i][j] = 0.1;
                  }
                  else {
                      var WS = Math.sqrt(U[i][j] * U[i][j] + V[i][j] * V[i][j]);
                      if (WS === 0) {
                          WS = 1;
                      }
                      Dx[i][j] = ((U[i][j] / WS) * deltX) / density;
                      Dy[i][j] = ((V[i][j] / WS) * deltY) / density;
                  }
              }
          }
          //Flag the grid boxes
          var SPoints = [];
          var flags = [];
          for (i = 0; i < yNum - 1; i++) {
              SPoints[i] = [];
              flags[i] = [];
              for (j = 0; j < xNum - 1; j++) {
                  if (i % 2 === 0 && j % 2 === 0) {
                      flags[i][j] = 0;
                  }
                  else {
                      flags[i][j] = 1;
                  }
                  SPoints[i][j] = [];
              }
          }
          //Tracing streamline
          var dis;
          var borderP;
          var lineN = 0;
          for (i = 0; i < yNum - 1; i++) {
              for (j = 0; j < xNum - 1; j++) {
                  if (flags[i][j] === 0) {
                      //No streamline started form this grid box, a new streamline started
                      var pList = [];
                      var aPoint = new PointD();
                      var ii = void 0, jj = void 0;
                      var loopN = void 0;
                      var aPL = new PolyLine();
                      //Start point - the center of the grid box
                      aPoint.x = X[j] + deltX / 2;
                      aPoint.y = Y[i] + deltY / 2;
                      pList.push(aPoint.clone());
                      borderP = new BorderPoint();
                      borderP.point = aPoint.clone();
                      borderP.id = lineN;
                      SPoints[i][j].push(borderP);
                      flags[i][j] = 1; //Flag the grid box and no streamline will start from this box again
                      ii = i;
                      jj = j;
                      var loopLimit = 500;
                      //Tracing forward
                      loopN = 0;
                      while (loopN < loopLimit) {
                          //Trace next streamline point
                          var iijj = [];
                          iijj[0] = ii;
                          iijj[1] = jj;
                          var isInDomain = tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, true);
                          ii = iijj[0];
                          jj = iijj[1];
                          //Terminating the streamline
                          if (isInDomain) {
                              if (Math.abs(U[ii][jj] / UNDEF - 1) < 0.01 ||
                                  Math.abs(U[ii][jj + 1] / UNDEF - 1) < 0.01 ||
                                  Math.abs(U[ii + 1][jj] / UNDEF - 1) < 0.01 ||
                                  Math.abs(U[ii + 1][jj + 1] / UNDEF - 1) < 0.01) {
                                  break;
                              }
                              else {
                                  var isTerminating = false;
                                  for (var _i = 0, _a = SPoints[ii][jj]; _i < _a.length; _i++) {
                                      var sPoint = _a[_i];
                                      if (Math.sqrt((aPoint.x - sPoint.point.x) * (aPoint.x - sPoint.point.x) +
                                          (aPoint.y - sPoint.point.y) * (aPoint.y - sPoint.point.y)) < radius) {
                                          isTerminating = true;
                                          break;
                                      }
                                  }
                                  if (!isTerminating) {
                                      if (SPoints[ii][jj].length > 1) {
                                          var pointStart = SPoints[ii][jj][0];
                                          var pointEnd = SPoints[ii][jj][1];
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
                                  }
                                  else {
                                      break;
                                  }
                              }
                          }
                          else {
                              break;
                          }
                          loopN += 1;
                      }
                      //Tracing backword
                      aPoint.x = X[j] + deltX / 2;
                      aPoint.y = Y[i] + deltY / 2;
                      ii = i;
                      jj = j;
                      loopN = 0;
                      while (loopN < loopLimit) {
                          //Trace next streamline point
                          var iijj = [];
                          iijj[0] = ii;
                          iijj[1] = jj;
                          var isInDomain = tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, false);
                          ii = iijj[0];
                          jj = iijj[1];
                          //Terminating the streamline
                          if (isInDomain) {
                              if (Math.abs(U[ii][jj] / UNDEF - 1) < 0.01 ||
                                  Math.abs(U[ii][jj + 1] / UNDEF - 1) < 0.01 ||
                                  Math.abs(U[ii + 1][jj] / UNDEF - 1) < 0.01 ||
                                  Math.abs(U[ii + 1][jj + 1] / UNDEF - 1) < 0.01) {
                                  break;
                              }
                              else {
                                  var isTerminating = false;
                                  for (var _b = 0, _c = SPoints[ii][jj]; _b < _c.length; _b++) {
                                      var sPoint = _c[_b];
                                      if (Math.sqrt((aPoint.x - sPoint.point.x) * (aPoint.x - sPoint.point.x) +
                                          (aPoint.y - sPoint.point.y) * (aPoint.y - sPoint.point.y)) < radius) {
                                          isTerminating = true;
                                          break;
                                      }
                                  }
                                  if (!isTerminating) {
                                      if (SPoints[ii][jj].length > 1) {
                                          var pointStart = SPoints[ii][jj][0];
                                          var pointEnd = SPoints[ii][jj][1];
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
                                  }
                                  else {
                                      break;
                                  }
                              }
                          }
                          else {
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
          //Return
          return streamLines;
      };
      Contour.insertPoint2Border = function (bPList, aBorderList) {
          var aBPoint, bP;
          var i, j;
          var p1, p2, p3;
          var BorderList = [];
          BorderList.push.apply(BorderList, aBorderList);
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
      };
      Contour.insertPoint2Border_Ring = function (S0, bPList, aBorder, pNums) {
          var aBPoint, bP;
          var i, j, k;
          var p1, p2, p3;
          //ArrayList aEPList = new ArrayList(), temEPList = new ArrayList(), dList = new ArrayList();
          var aBLine;
          var newBPList = [], tempBPList = [], tempBPList1 = [];
          //pNums = new int[aBorder.getLineNum()];
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
                  //aBPoint = (BorderPoint)tempBPList[0];
                  p1 = tempBPList[0].point.clone();
                  for (j = 1; j < tempBPList.length; j++) {
                      //aBPoint = (BorderPoint)tempBPList[j];
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
              newBPList.push.apply(newBPList, tempBPList1);
          }
          return newBPList;
      };
      Contour._endPointList = [];
      return Contour;
  }());

  function BSpline(pointList, t, i) {
      var f = fb(t);
      var x = 0;
      var y = 0;
      for (var j = 0; j < 4; j++) {
          var aPoint = pointList[i + j];
          x = x + f[j] * aPoint.x;
          y = y + f[j] * aPoint.y;
      }
      return [x, y];
  }
  function f0(t) {
      return (1.0 / 6) * (-t + 1) * (-t + 1) * (-t + 1);
  }
  function f1(t) {
      return (1.0 / 6) * (3 * t * t * t - 6 * t * t + 4);
  }
  function f2(t) {
      return (1.0 / 6) * (-3 * t * t * t + 3 * t * t + 3 * t + 1);
  }
  function f3(t) {
      return (1.0 / 6) * t * t * t;
  }
  function fb(t) {
      return [f0(t), f1(t), f2(t), f3(t)];
  }
  function BSplineScanning(pointList, sum) {
      var t;
      var i;
      var X, Y;
      var aPoint;
      var newPList = [];
      if (sum < 4) {
          return null;
      }
      var isClose = false;
      aPoint = pointList[0];
      var bPoint = pointList[sum - 1];
      if (aPoint.x === bPoint.x && aPoint.y === bPoint.y) {
          pointList.splice(0, 1);
          //pointList.remove(0);
          pointList.push(pointList[0]);
          pointList.push(pointList[1]);
          pointList.push(pointList[2]);
          pointList.push(pointList[3]);
          pointList.push(pointList[4]);
          pointList.push(pointList[5]);
          pointList.push(pointList[6]);
          //pointList.push(pointList[7]);
          //pointList.push(pointList[8]);
          isClose = true;
      }
      sum = pointList.length;
      for (i = 0; i < sum - 3; i++) {
          for (t = 0; t <= 1; t += 0.05) {
              var xy = BSpline(pointList, t, i);
              X = xy[0];
              Y = xy[1];
              if (isClose) {
                  if (i > 3) {
                      aPoint = new PointD();
                      aPoint.x = X;
                      aPoint.y = Y;
                      newPList.push(aPoint);
                  }
              }
              else {
                  aPoint = new PointD();
                  aPoint.x = X;
                  aPoint.y = Y;
                  newPList.push(aPoint);
              }
          }
      }
      if (isClose) {
          newPList.push(newPList[0]);
      }
      else {
          newPList.splice(0, 0, pointList[0]);
          //newPList.push(0, pointList[0]);
          newPList.push(pointList[pointList.length - 1]);
      }
      return newPList;
  }

  /**
   * Smooth polylines
   *
   * @param aLineList polyline list
   * @return smoothed polyline list
   */
  function smoothLines(aLineList) {
      var newLineList = [];
      for (var i = 0; i < aLineList.length; i++) {
          var aline = aLineList[i];
          var newPList = aline.pointList;
          if (newPList.length <= 1) {
              continue;
          }
          if (newPList.length === 2) {
              var bP = new PointD();
              var aP = newPList[0];
              var cP = newPList[1];
              bP.x = (cP.x - aP.x) / 4 + aP.x;
              bP.y = (cP.y - aP.y) / 4 + aP.y;
              newPList.splice(1, 0, bP);
              bP = new PointD();
              bP.x = ((cP.x - aP.x) / 4) * 3 + aP.x;
              bP.y = ((cP.y - aP.y) / 4) * 3 + aP.y;
              newPList.splice(2, 0, bP);
          }
          if (newPList.length === 3) {
              var bP = new PointD();
              var aP = newPList[0];
              var cP = newPList[1];
              bP.x = (cP.x - aP.x) / 2 + aP.x;
              bP.y = (cP.y - aP.y) / 2 + aP.y;
              newPList.splice(1, 0, bP);
          }
          var smoothedPList = BSplineScanning(newPList, newPList.length);
          aline.pointList = smoothedPList;
          newLineList.push(aline);
      }
      return newLineList;
  }

  function getFeatureOfPoints(typeStr, currentLine, anVals, polygon) {
      var coors = [];
      for (var _i = 0, _a = currentLine.pointList; _i < _a.length; _i++) {
          var pt = _a[_i];
          coors.push([pt.x, pt.y]);
      }
      var geometry;
      var val = currentLine.value;
      if (typeStr === 'LineString') {
          geometry = {
              type: 'LineString',
              coordinates: coors,
          };
      }
      else {
          geometry = {
              type: 'Polygon',
              coordinates: [coors],
          };
          if (polygon && anVals) {
              if (polygon.isHighCenter) {
                  var idx = anVals.indexOf(polygon.lowValue);
                  if (idx >= 0 && idx < anVals.length - 1)
                      val = anVals[idx + 1];
                  else
                      val = polygon.highValue;
              }
              else {
                  val = polygon.lowValue;
              }
              if (polygon.hasHoles()) {
                  for (var i = 0; i < polygon.holeLines.length; i++) {
                      var hole = polygon.holeLines[i];
                      var holeCoors = [];
                      for (var _b = 0, _c = hole.pointList; _b < _c.length; _b++) {
                          var pt = _c[_b];
                          holeCoors.push([pt.x, pt.y]);
                      }
                      geometry['coordinates'].push(holeCoors);
                  }
              }
          }
      }
      var properties = {
          id: currentLine.BorderIdx,
          value: val,
      };
      var feature = {
          type: 'Feature',
          geometry: geometry,
          properties: properties,
      };
      return feature;
  }

  var uti = {
      smoothLines: smoothLines,
      getFeatureOfPoints: getFeatureOfPoints,
  };

  exports.Contour = Contour;
  exports.uti = uti;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
