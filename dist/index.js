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

  var Line = /** @class */ (function () {
      function Line() {
      }
      return Line;
  }());

  var PolyLine = /** @class */ (function () {
      function PolyLine() {
          this.pointList = [];
      }
      return PolyLine;
  }());

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
              var aLine = new PolyLine();
              aLine.pointList = pList;
              this.holeLines.push(aLine);
          }
      };
      return Polygon;
  }());

  function traceBorder(s1, i1, i2, j1, j2, ij3) {
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

  function doubleEquals(a, b) {
      var difference = Math.abs(a * 0.00001);
      return Math.abs(a - b) <= difference;
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
  function isLineSegmentCross(lineA, lineB) {
      var boundA = new Extent(), boundB = new Extent();
      var PListA = [], PListB = [];
      PListA.push(lineA.P1);
      PListA.push(lineA.P2);
      PListB.push(lineB.P1);
      PListB.push(lineB.P2);
      getExtentAndArea(PListA, boundA);
      getExtentAndArea(PListB, boundB);
      if (!isExtentCross(boundA, boundB)) {
          return false;
      }
      else {
          var XP1 = (lineB.P1.x - lineA.P1.x) * (lineA.P2.y - lineA.P1.y) -
              (lineA.P2.x - lineA.P1.x) * (lineB.P1.y - lineA.P1.y);
          var XP2 = (lineB.P2.x - lineA.P1.x) * (lineA.P2.y - lineA.P1.y) -
              (lineA.P2.x - lineA.P1.x) * (lineB.P2.y - lineA.P1.y);
          if (XP1 * XP2 > 0) {
              return false;
          }
          else {
              return true;
          }
      }
  }
  function isExtentCross(aBound, bBound) {
      if (aBound.xMin > bBound.xMax ||
          aBound.xMax < bBound.xMin ||
          aBound.yMin > bBound.yMax ||
          aBound.yMax < bBound.yMin) {
          return false;
      }
      else {
          return true;
      }
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
      var xNew, yNew, xOld, yOld;
      var x1, y1, x2, y2;
      var i;
      var inside = false;
      var nPoints = poly.length;
      if (nPoints < 3) {
          return false;
      }
      xOld = poly[nPoints - 1].x;
      yOld = poly[nPoints - 1].y;
      for (i = 0; i < nPoints; i++) {
          xNew = poly[i].x;
          yNew = poly[i].y;
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
                          if (traceBorder(s2, i1, i2, j1, j2, ij3)) {
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
                      aPolygonList = Contour.tracingPolygons_Ring(lineList, newBPList, aBorder, contour, pNums);
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
                      Contour.addHoles_Ring(aPolygonList, holeList);
                  }
                  aPolygonList = Contour.addPolygonHoles_Ring(aPolygonList);
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
      /**
       * Judge if a point is in a polygon
       *
       * @param aPolygon polygon
       * @param aPoint point
       * @return if the point is in the polygon
       */
      Contour.pointInPolygon = function (aPolygon, aPoint) {
          if (aPolygon.hasHoles()) {
              var isIn = pointInPolygonByPList(aPolygon.outLine.pointList, aPoint);
              if (isIn) {
                  for (var _i = 0, _a = aPolygon.holeLines; _i < _a.length; _i++) {
                      var aLine = _a[_i];
                      if (pointInPolygonByPList(aLine.pointList, aPoint)) {
                          isIn = false;
                          break;
                      }
                  }
              }
              return isIn;
          }
          else {
              return pointInPolygonByPList(aPolygon.outLine.pointList, aPoint);
          }
      };
      /**
       * Clip polylines with a border polygon
       *
       * @param polylines polyline list
       * @param clipPList clipping border point list
       * @return clipped polylines
       */
      Contour.clipPolylines = function (polylines, clipPList) {
          var newPolylines = [];
          for (var _i = 0, polylines_1 = polylines; _i < polylines_1.length; _i++) {
              var aPolyline = polylines_1[_i];
              newPolylines.push.apply(newPolylines, Contour.cutPolyline(aPolyline, clipPList));
          }
          return newPolylines;
      };
      /**
       * Clip polygons with a border polygon
       *
       * @param polygons polygon list
       * @param clipPList clipping border point list
       * @return clipped polygons
       */
      Contour.clipPolygons = function (polygons, clipPList) {
          var newPolygons = [];
          var ps = clipPList.map(function (item) { return new PointD(item.x, item.y); });
          for (var i = 0; i < polygons.length; i++) {
              var aPolygon = polygons[i];
              if (aPolygon.hasHoles()) {
                  newPolygons.push.apply(newPolygons, Contour.cutPolygon_Hole(aPolygon, ps));
              }
              else {
                  newPolygons.push.apply(newPolygons, Contour.cutPolygon(aPolygon, ps));
              }
          }
          //Sort polygons with bording rectangle area
          var outPolygons = [];
          var isInserted;
          for (var i = 0; i < newPolygons.length; i++) {
              var aPolygon = newPolygons[i];
              isInserted = false;
              for (var j = 0; j < outPolygons.length; j++) {
                  if (aPolygon.area > outPolygons[j].area) {
                      outPolygons.splice(j, 0, aPolygon);
                      isInserted = true;
                      break;
                  }
              }
              if (!isInserted) {
                  outPolygons.push(aPolygon);
              }
          }
          return outPolygons;
      };
      Contour.traceIsoline_UndefData = function (i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS) {
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
                                  if (Contour.traceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
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
                                  if (Contour.traceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
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
                          if (Contour.traceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
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
                          if (Contour.traceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
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
      Contour.traceIsoline = function (i1, i2, H, S, j1, j2, X, Y, nx, ny, a2x) {
          var i3, j3;
          var a3x, a3y;
          if (i1 < i2) {
              //---- Trace from bottom
              if (H[i2][j2] !== -2 && H[i2][j2 + 1] !== -2) {
                  if (H[i2][j2] < H[i2][j2 + 1]) {
                      a3x = X[j2];
                      a3y = Y[i2] + H[i2][j2] * ny;
                      i3 = i2;
                      j3 = j2;
                      H[i3][j3] = -2;
                  }
                  else {
                      a3x = X[j2 + 1];
                      a3y = Y[i2] + H[i2][j2 + 1] * ny;
                      i3 = i2;
                      j3 = j2 + 1;
                      H[i3][j3] = -2;
                  }
              }
              else if (H[i2][j2] !== -2 && H[i2][j2 + 1] === -2) {
                  a3x = X[j2];
                  a3y = Y[i2] + H[i2][j2] * ny;
                  i3 = i2;
                  j3 = j2;
                  H[i3][j3] = -2;
              }
              else if (H[i2][j2] === -2 && H[i2][j2 + 1] !== -2) {
                  a3x = X[j2 + 1];
                  a3y = Y[i2] + H[i2][j2 + 1] * ny;
                  i3 = i2;
                  j3 = j2 + 1;
                  H[i3][j3] = -2;
              }
              else {
                  a3x = X[j2] + S[i2 + 1][j2] * nx;
                  a3y = Y[i2 + 1];
                  i3 = i2 + 1;
                  j3 = j2;
                  S[i3][j3] = -2;
              }
          }
          else if (j1 < j2) {
              //---- Trace from left
              if (S[i2][j2] !== -2 && S[i2 + 1][j2] !== -2) {
                  if (S[i2][j2] < S[i2 + 1][j2]) {
                      a3x = X[j2] + S[i2][j2] * nx;
                      a3y = Y[i2];
                      i3 = i2;
                      j3 = j2;
                      S[i3][j3] = -2;
                  }
                  else {
                      a3x = X[j2] + S[i2 + 1][j2] * nx;
                      a3y = Y[i2 + 1];
                      i3 = i2 + 1;
                      j3 = j2;
                      S[i3][j3] = -2;
                  }
              }
              else if (S[i2][j2] !== -2 && S[i2 + 1][j2] === -2) {
                  a3x = X[j2] + S[i2][j2] * nx;
                  a3y = Y[i2];
                  i3 = i2;
                  j3 = j2;
                  S[i3][j3] = -2;
              }
              else if (S[i2][j2] === -2 && S[i2 + 1][j2] !== -2) {
                  a3x = X[j2] + S[i2 + 1][j2] * nx;
                  a3y = Y[i2 + 1];
                  i3 = i2 + 1;
                  j3 = j2;
                  S[i3][j3] = -2;
              }
              else {
                  a3x = X[j2 + 1];
                  a3y = Y[i2] + H[i2][j2 + 1] * ny;
                  i3 = i2;
                  j3 = j2 + 1;
                  H[i3][j3] = -2;
              }
          }
          else if (X[j2] < a2x) {
              //---- Trace from top
              if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] !== -2) {
                  if (H[i2 - 1][j2] > H[i2 - 1][j2 + 1]) {
                      //---- < changed to >
                      a3x = X[j2];
                      a3y = Y[i2 - 1] + H[i2 - 1][j2] * ny;
                      i3 = i2 - 1;
                      j3 = j2;
                      H[i3][j3] = -2;
                  }
                  else {
                      a3x = X[j2 + 1];
                      a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * ny;
                      i3 = i2 - 1;
                      j3 = j2 + 1;
                      H[i3][j3] = -2;
                  }
              }
              else if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] === -2) {
                  a3x = X[j2];
                  a3y = Y[i2 - 1] + H[i2 - 1][j2] * ny;
                  i3 = i2 - 1;
                  j3 = j2;
                  H[i3][j3] = -2;
              }
              else if (H[i2 - 1][j2] === -2 && H[i2 - 1][j2 + 1] !== -2) {
                  a3x = X[j2 + 1];
                  a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * ny;
                  i3 = i2 - 1;
                  j3 = j2 + 1;
                  H[i3][j3] = -2;
              }
              else {
                  a3x = X[j2] + S[i2 - 1][j2] * nx;
                  a3y = Y[i2 - 1];
                  i3 = i2 - 1;
                  j3 = j2;
                  S[i3][j3] = -2;
              }
          } //---- Trace from right
          else {
              if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] !== -2) {
                  if (S[i2 + 1][j2 - 1] > S[i2][j2 - 1]) {
                      //---- < changed to >
                      a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * nx;
                      a3y = Y[i2 + 1];
                      i3 = i2 + 1;
                      j3 = j2 - 1;
                      S[i3][j3] = -2;
                  }
                  else {
                      a3x = X[j2 - 1] + S[i2][j2 - 1] * nx;
                      a3y = Y[i2];
                      i3 = i2;
                      j3 = j2 - 1;
                      S[i3][j3] = -2;
                  }
              }
              else if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] === -2) {
                  a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * nx;
                  a3y = Y[i2 + 1];
                  i3 = i2 + 1;
                  j3 = j2 - 1;
                  S[i3][j3] = -2;
              }
              else if (S[i2 + 1][j2 - 1] === -2 && S[i2][j2 - 1] !== -2) {
                  a3x = X[j2 - 1] + S[i2][j2 - 1] * nx;
                  a3y = Y[i2];
                  i3 = i2;
                  j3 = j2 - 1;
                  S[i3][j3] = -2;
              }
              else {
                  a3x = X[j2 - 1];
                  a3y = Y[i2] + H[i2][j2 - 1] * ny;
                  i3 = i2;
                  j3 = j2 - 1;
                  H[i3][j3] = -2;
              }
          }
          return [i3, j3, a3x, a3y];
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
          aPolygonList = Contour.judgePolygonHighCenter(aPolygonList, cPolygonlist, aLineList, borderList);
          return aPolygonList;
      };
      Contour.tracingClipPolygons = function (inPolygon, LineList, borderList) {
          if (LineList.length === 0) {
              return [];
          }
          var aPolygonList = [];
          var aLineList = [];
          var aLine;
          var aPoint;
          var aPolygon;
          var aBound;
          aLineList.push.apply(aLineList, LineList);
          //---- Tracing border polygon
          var aPList;
          var newPList = [];
          var bP;
          var timesArray = [];
          timesArray.length = borderList.length - 1;
          for (var i = 0; i < timesArray.length; i++) {
              timesArray[i] = 0;
          }
          var pIdx, pNum;
          var lineBorderList = [];
          pNum = borderList.length - 1;
          var bPoint, b1Point;
          for (var i = 0; i < pNum; i++) {
              if (borderList[i].id === -1) {
                  continue;
              }
              pIdx = i;
              lineBorderList.push(borderList[i]);
              //bP = borderList[pIdx];
              b1Point = borderList[pIdx].point;
              //---- Clockwise tracing
              if (timesArray[pIdx] < 1) {
                  aPList = [];
                  aPList.push(borderList[pIdx].point);
                  pIdx += 1;
                  if (pIdx === pNum) {
                      pIdx = 0;
                  }
                  bPoint = borderList[pIdx].point.clone();
                  if (borderList[pIdx].id === -1) {
                      var aIdx = pIdx + 10;
                      for (var o = 1; o <= 10; o++) {
                          if (borderList[pIdx + o].id > -1) {
                              aIdx = pIdx + o - 1;
                              break;
                          }
                      }
                      bPoint = borderList[aIdx].point.clone();
                  }
                  else {
                      bPoint.x = (bPoint.x + b1Point.x) / 2;
                      bPoint.y = (bPoint.y + b1Point.y) / 2;
                  }
                  if (Contour.pointInPolygon(inPolygon, bPoint)) {
                      while (true) {
                          bP = borderList[pIdx];
                          if (bP.id === -1) {
                              //---- Not endpoint of contour
                              if (timesArray[pIdx] === 1) {
                                  break;
                              }
                              aPList.push(bP.point);
                              timesArray[pIdx] += 1;
                          } //---- endpoint of contour
                          else {
                              if (timesArray[pIdx] === 1) {
                                  break;
                              }
                              timesArray[pIdx] += 1;
                              aLine = aLineList[bP.id];
                              newPList = [];
                              newPList.push.apply(newPList, aLine.pointList);
                              aPoint = newPList[0];
                              if (!(doubleEquals(bP.point.x, aPoint.x) && doubleEquals(bP.point.y, aPoint.y))) {
                                  //---- Start point
                                  newPList.reverse();
                              }
                              aPList.push.apply(aPList, newPList);
                              for (var j = 0; j < borderList.length - 1; j++) {
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
                                  aPolygon.lowValue = inPolygon.lowValue;
                                  aPolygon.highValue = inPolygon.highValue;
                                  aBound = new Extent();
                                  aPolygon.area = getExtentAndArea(aPList, aBound);
                                  aPolygon.isClockWise = true;
                                  aPolygon.startPointIdx = lineBorderList.length - 1;
                                  aPolygon.extent = aBound;
                                  aPolygon.outLine.pointList = aPList;
                                  aPolygon.outLine.value = inPolygon.lowValue;
                                  aPolygon.isHighCenter = inPolygon.isHighCenter;
                                  aPolygon.outLine.type = 'Border';
                                  aPolygon.holeLines = [];
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
              }
              //---- Anticlockwise traceing
              pIdx = i;
              if (timesArray[pIdx] < 1) {
                  aPList = [];
                  aPList.push(borderList[pIdx].point);
                  pIdx += -1;
                  if (pIdx === -1) {
                      pIdx = pNum - 1;
                  }
                  bPoint = borderList[pIdx].point.clone();
                  if (borderList[pIdx].id === -1) {
                      var aIdx = pIdx + 10;
                      for (var o = 1; o <= 10; o++) {
                          if (borderList[pIdx + o].id > -1) {
                              aIdx = pIdx + o - 1;
                              break;
                          }
                      }
                      bPoint = borderList[aIdx].point.clone();
                  }
                  else {
                      bPoint.x = (bPoint.x + b1Point.x) / 2;
                      bPoint.y = (bPoint.y + b1Point.y) / 2;
                  }
                  if (Contour.pointInPolygon(inPolygon, bPoint)) {
                      while (true) {
                          bP = borderList[pIdx];
                          if (bP.id === -1) {
                              //---- Not endpoint of contour
                              if (timesArray[pIdx] === 1) {
                                  break;
                              }
                              aPList.push(bP.point);
                              timesArray[pIdx] += 1;
                          } //---- endpoint of contour
                          else {
                              if (timesArray[pIdx] === 1) {
                                  break;
                              }
                              timesArray[pIdx] += 1;
                              aLine = aLineList[bP.id];
                              newPList = [];
                              newPList.push.apply(newPList, aLine.pointList);
                              aPoint = newPList[0];
                              if (!(doubleEquals(bP.point.x, aPoint.x) && doubleEquals(bP.point.y, aPoint.y))) {
                                  //---- Start point
                                  newPList.reverse();
                              }
                              aPList.push.apply(aPList, newPList);
                              for (var j = 0; j < borderList.length - 1; j++) {
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
                                  aPolygon.lowValue = inPolygon.lowValue;
                                  aPolygon.highValue = inPolygon.highValue;
                                  aBound = new Extent();
                                  aPolygon.area = getExtentAndArea(aPList, aBound);
                                  aPolygon.isClockWise = false;
                                  aPolygon.startPointIdx = lineBorderList.length - 1;
                                  aPolygon.extent = aBound;
                                  aPolygon.outLine.pointList = aPList;
                                  aPolygon.outLine.value = inPolygon.lowValue;
                                  aPolygon.isHighCenter = inPolygon.isHighCenter;
                                  aPolygon.outLine.type = 'Border';
                                  aPolygon.holeLines = [];
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
          }
          return aPolygonList;
      };
      Contour.judgePolygonHighCenter = function (borderPolygons, closedPolygons, aLineList, borderList) {
          var _a;
          var i, j;
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
          for (i = 1; i < polygonNum; i++) {
              aPolygon = borderPolygons[i];
              if (aPolygon.outLine.type === 'Close') {
                  cBound1 = aPolygon.extent;
                  //aValue = aPolygon.lowValue;
                  aPoint = aPolygon.outLine.pointList[0];
                  for (j = i - 1; j >= 0; j--) {
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
                              //                            if (aValue < bValue) {
                              //                                aPolygon.isHighCenter = false;
                              //                                //borderPolygons[i] = aPolygon;
                              //                            } else if (aValue === bValue) {
                              //                                if (!bPolygon.isHighCenter) {
                              //                                    aPolygon.isHighCenter = false;
                              //                                    //borderPolygons[i] = aPolygon;
                              //                                }
                              //                            }
                              break;
                          }
                      }
                  }
              }
          }
          return borderPolygons;
      };
      Contour.judgePolygonHighCenter_old = function (borderPolygons, closedPolygons, aLineList, borderList) {
          var _a;
          var i, j;
          var aPolygon;
          var aLine;
          var newPList = [];
          var aBound;
          var aValue;
          var bValue;
          var aPoint;
          if (borderPolygons.length === 0) {
              //Add border polygon
              //Get max & min contour values
              var max = aLineList[0].value, min = aLineList[0].value;
              for (var _i = 0, aLineList_2 = aLineList; _i < aLineList_2.length; _i++) {
                  var aPLine = aLineList_2[_i];
                  if (aPLine.value > max) {
                      max = aPLine.value;
                  }
                  if (aPLine.value < min) {
                      min = aPLine.value;
                  }
              }
              aPolygon = new Polygon();
              aLine = new PolyLine();
              aLine.type = 'Border';
              aLine.value = min;
              aPolygon.isHighCenter = false;
              if (closedPolygons.length > 0) {
                  if (borderList[0].value >= closedPolygons[0].lowValue) {
                      aLine.value = max;
                      aPolygon.isHighCenter = true;
                  }
              }
              newPList = [];
              for (var _b = 0, borderList_2 = borderList; _b < borderList_2.length; _b++) {
                  var aP = borderList_2[_b];
                  newPList.push(aP.point);
              }
              aLine.pointList = [];
              (_a = aLine.pointList).push.apply(_a, newPList);
              if (aLine.pointList.length > 0) {
                  aPolygon.isBorder = true;
                  aPolygon.lowValue = aLine.value;
                  aPolygon.highValue = aLine.value;
                  aBound = new Extent();
                  aPolygon.area = getExtentAndArea(aLine.pointList, aBound);
                  aPolygon.isClockWise = isClockwise(aLine.pointList);
                  aPolygon.extent = aBound;
                  aPolygon.outLine = aLine;
                  aPolygon.holeLines = [];
                  //aPolygon.isHighCenter = false;
                  borderPolygons.push(aPolygon);
              }
          }
          //---- Add close polygons to form total polygons list
          borderPolygons.push.apply(borderPolygons, closedPolygons);
          //---- Juge isHighCenter for close polygons
          var cBound1, cBound2;
          var polygonNum = borderPolygons.length;
          var bPolygon;
          for (i = 1; i < polygonNum; i++) {
              aPolygon = borderPolygons[i];
              if (aPolygon.outLine.type === 'Close') {
                  cBound1 = aPolygon.extent;
                  aValue = aPolygon.lowValue;
                  aPoint = aPolygon.outLine.pointList[0];
                  for (j = i - 1; j >= 0; j--) {
                      bPolygon = borderPolygons[j];
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
                                  //borderPolygons[i] = aPolygon;
                              }
                              else if (aValue === bValue) {
                                  if (bPolygon.isHighCenter) {
                                      aPolygon.isHighCenter = false;
                                      //borderPolygons[i] = aPolygon;
                                  }
                              }
                              break;
                          }
                      }
                  }
              }
          }
          return borderPolygons;
      };
      Contour.tracingPolygons_Ring = function (LineList, borderList, aBorder, contour, pNums) {
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
      Contour.addPolygonHoles_Ring = function (polygonList) {
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
      };
      Contour.addHoles_Ring = function (polygonList, holeList) {
          var i, j;
          for (i = 0; i < holeList.length; i++) {
              var holePs = holeList[i];
              var aExtent = getExtent(holePs);
              for (j = polygonList.length - 1; j >= 0; j--) {
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
      };
      Contour.cutPolyline = function (inPolyline, clipPList) {
          var newPolylines = [];
          var aPList = inPolyline.pointList;
          var plExtent = getExtent(aPList);
          var cutExtent = getExtent(clipPList);
          if (!isExtentCross(plExtent, cutExtent)) {
              return newPolylines;
          }
          var i, j;
          if (!isClockwise(clipPList)) {
              //---- Make cut polygon clockwise
              clipPList.reverse();
          }
          //Judge if all points of the polyline are in the cut polygon
          if (pointInPolygonByPList(clipPList, aPList[0])) {
              var isAllIn = true;
              var notInIdx = 0;
              for (i = 0; i < aPList.length; i++) {
                  if (!pointInPolygonByPList(clipPList, aPList[i])) {
                      notInIdx = i;
                      isAllIn = false;
                      break;
                  }
              }
              //if (!isAllIn && inPolyline.type === "Close")   //Put start point outside of the cut polygon
              if (!isAllIn) {
                  if (inPolyline.type === 'Close') {
                      var bPList = [];
                      //bPList.AddRange(aPList.getRange(notInIdx, aPList.length - notInIdx));
                      //bPList.AddRange(aPList.GetRange(1, notInIdx - 1));
                      for (i = notInIdx; i < aPList.length; i++) {
                          bPList.push(aPList[i]);
                      }
                      for (i = 1; i < notInIdx; i++) {
                          bPList.push(aPList[i]);
                      }
                      bPList.push(bPList[0]);
                      aPList = [];
                      aPList.push.apply(aPList, bPList);
                  }
                  else {
                      aPList.reverse();
                  }
              } //the input polygon is inside the cut polygon
              else {
                  newPolylines.push(inPolyline);
                  return newPolylines;
              }
          }
          //Cutting
          var isInPolygon = pointInPolygonByPList(clipPList, aPList[0]);
          var q1, q2, p1, p2, IPoint;
          var lineA, lineB;
          var newPlist = [];
          var bLine;
          p1 = aPList[0];
          for (i = 1; i < aPList.length; i++) {
              p2 = aPList[i];
              if (pointInPolygonByPList(clipPList, p2)) {
                  if (!isInPolygon) {
                      IPoint = new PointD();
                      lineA = new Line();
                      lineA.P1 = p1;
                      lineA.P2 = p2;
                      q1 = clipPList[clipPList.length - 1];
                      for (j = 0; j < clipPList.length; j++) {
                          q2 = clipPList[j];
                          lineB = new Line();
                          lineB.P1 = q1;
                          lineB.P2 = q2;
                          if (isLineSegmentCross(lineA, lineB)) {
                              IPoint = Contour.getCrossPointD(lineA, lineB);
                              break;
                          }
                          q1 = q2;
                      }
                      newPlist.push(IPoint);
                      //aType = "Border";
                  }
                  newPlist.push(aPList[i]);
                  isInPolygon = true;
              }
              else if (isInPolygon) {
                  IPoint = new PointD();
                  lineA = new Line();
                  lineA.P1 = p1;
                  lineA.P2 = p2;
                  q1 = clipPList[clipPList.length - 1];
                  for (j = 0; j < clipPList.length; j++) {
                      q2 = clipPList[j];
                      lineB = new Line();
                      lineB.P1 = q1;
                      lineB.P2 = q2;
                      if (isLineSegmentCross(lineA, lineB)) {
                          IPoint = Contour.getCrossPointD(lineA, lineB);
                          break;
                      }
                      q1 = q2;
                  }
                  newPlist.push(IPoint);
                  bLine = new PolyLine();
                  bLine.value = inPolyline.value;
                  bLine.type = inPolyline.type;
                  bLine.pointList = newPlist;
                  newPolylines.push(bLine);
                  isInPolygon = false;
                  newPlist = [];
                  //aType = "Border";
              }
              p1 = p2;
          }
          if (isInPolygon && newPlist.length > 1) {
              bLine = new PolyLine();
              bLine.value = inPolyline.value;
              bLine.type = inPolyline.type;
              bLine.pointList = newPlist;
              newPolylines.push(bLine);
          }
          return newPolylines;
      };
      Contour.cutPolygon_Hole = function (inPolygon, clipPList) {
          var newPolygons = [];
          var newPolylines = [];
          var aPList = inPolygon.outLine.pointList;
          var plExtent = getExtent(aPList);
          var cutExtent = getExtent(clipPList);
          if (!isExtentCross(plExtent, cutExtent)) {
              return newPolygons;
          }
          var i, j;
          if (!isClockwise(clipPList)) {
              //---- Make cut polygon clockwise
              clipPList.reverse();
          }
          //Judge if all points of the polyline are in the cut polygon - outline
          var newLines = [];
          if (pointInPolygonByPList(clipPList, aPList[0])) {
              var isAllIn = true;
              var notInIdx = 0;
              for (i = 0; i < aPList.length; i++) {
                  if (!pointInPolygonByPList(clipPList, aPList[i])) {
                      notInIdx = i;
                      isAllIn = false;
                      break;
                  }
              }
              if (!isAllIn) {
                  //Put start point outside of the cut polygon
                  var bPList = [];
                  //bPList.AddRange(aPList.GetRange(notInIdx, aPList.Count - notInIdx));
                  //bPList.AddRange(aPList.GetRange(1, notInIdx - 1));
                  for (i = notInIdx; i < aPList.length; i++) {
                      bPList.push(aPList[i]);
                  }
                  for (i = 1; i < notInIdx; i++) {
                      bPList.push(aPList[i]);
                  }
                  bPList.push(bPList[0]);
                  //if (!uti.isClockwise(bPList))
                  //    bPList.Reverse();
                  newLines.push(bPList);
              } //the input polygon is inside the cut polygon
              else {
                  newPolygons.push(inPolygon);
                  return newPolygons;
              }
          }
          else {
              newLines.push(aPList);
          }
          //Holes
          var holeLines = [];
          for (var h = 0; h < inPolygon.holeLines.length; h++) {
              var holePList = inPolygon.holeLines[h].pointList;
              plExtent = getExtent(holePList);
              if (!isExtentCross(plExtent, cutExtent)) {
                  continue;
              }
              if (pointInPolygonByPList(clipPList, holePList[0])) {
                  var isAllIn = true;
                  var notInIdx = 0;
                  for (i = 0; i < holePList.length; i++) {
                      if (!pointInPolygonByPList(clipPList, holePList[i])) {
                          notInIdx = i;
                          isAllIn = false;
                          break;
                      }
                  }
                  if (!isAllIn) {
                      //Put start point outside of the cut polygon
                      var bPList = [];
                      //bPList.AddRange(holePList.GetRange(notInIdx, holePList.Count - notInIdx));
                      //bPList.AddRange(holePList.GetRange(1, notInIdx - 1));
                      for (i = notInIdx; i < holePList.length; i++) {
                          bPList.push(holePList[i]);
                      }
                      for (i = 1; i < notInIdx; i++) {
                          bPList.push(holePList[i]);
                      }
                      bPList.push(bPList[0]);
                      newLines.push(bPList);
                  } //the hole is inside the cut polygon
                  else {
                      holeLines.push(holePList);
                  }
              }
              else {
                  newLines.push(holePList);
              }
          }
          //Prepare border point list
          var borderList = [];
          var aBP = new BorderPoint();
          for (var _i = 0, clipPList_1 = clipPList; _i < clipPList_1.length; _i++) {
              var aP = clipPList_1[_i];
              aBP = new BorderPoint();
              aBP.point = aP;
              aBP.id = -1;
              borderList.push(aBP);
          }
          //Cutting
          for (var l = 0; l < newLines.length; l++) {
              aPList = newLines[l];
              var isInPolygon = false;
              var q1 = void 0, q2 = void 0, p1 = void 0, p2 = void 0, IPoint = void 0;
              var lineA = void 0, lineB = void 0;
              var newPlist = [];
              var bLine = void 0;
              p1 = aPList[0];
              var inIdx = -1, outIdx = -1;
              var newLine = true;
              var a1 = 0;
              for (i = 1; i < aPList.length; i++) {
                  p2 = aPList[i];
                  if (pointInPolygonByPList(clipPList, p2)) {
                      if (!isInPolygon) {
                          lineA = new Line();
                          lineA.P1 = p1;
                          lineA.P2 = p2;
                          q1 = borderList[borderList.length - 1].point;
                          IPoint = new PointD();
                          for (j = 0; j < borderList.length; j++) {
                              q2 = borderList[j].point;
                              lineB = new Line();
                              lineB.P1 = q1;
                              lineB.P2 = q2;
                              if (isLineSegmentCross(lineA, lineB)) {
                                  IPoint = Contour.getCrossPointD(lineA, lineB);
                                  aBP = new BorderPoint();
                                  aBP.id = newPolylines.length;
                                  aBP.point = IPoint;
                                  borderList.splice(j, 0, aBP);
                                  inIdx = j;
                                  break;
                              }
                              q1 = q2;
                          }
                          newPlist.push(IPoint);
                      }
                      newPlist.push(aPList[i]);
                      isInPolygon = true;
                  }
                  else if (isInPolygon) {
                      lineA = new Line();
                      lineA.P1 = p1;
                      lineA.P2 = p2;
                      q1 = borderList[borderList.length - 1].point;
                      IPoint = new PointD();
                      for (j = 0; j < borderList.length; j++) {
                          q2 = borderList[j].point;
                          lineB = new Line();
                          lineB.P1 = q1;
                          lineB.P2 = q2;
                          if (isLineSegmentCross(lineA, lineB)) {
                              if (!newLine) {
                                  if (inIdx - outIdx >= 1 && inIdx - outIdx <= 10) {
                                      if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                                          borderList.splice(inIdx, 1);
                                          borderList.splice(outIdx, 0, aBP);
                                          //borderList.remove(inIdx);
                                          //borderList.push(outIdx, aBP);
                                      }
                                  }
                                  else if (inIdx - outIdx <= -1 && inIdx - outIdx >= -10) {
                                      if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                                          borderList.splice(inIdx, 1);
                                          borderList.splice(outIdx + 1, 0, aBP);
                                          //borderList.remove(inIdx);
                                          //borderList.push(outIdx + 1, aBP);
                                      }
                                  }
                                  else if (inIdx === outIdx) {
                                      if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                                          borderList.splice(inIdx, 1);
                                          borderList.splice(inIdx + 1, 0, aBP);
                                          //borderList.remove(inIdx);
                                          //borderList.push(inIdx + 1, aBP);
                                      }
                                  }
                              }
                              IPoint = Contour.getCrossPointD(lineA, lineB);
                              aBP = new BorderPoint();
                              aBP.id = newPolylines.length;
                              aBP.point = IPoint;
                              borderList.splice(j, 0, aBP);
                              //borderList.push(j, aBP);
                              outIdx = j;
                              a1 = inIdx;
                              newLine = false;
                              break;
                          }
                          q1 = q2;
                      }
                      newPlist.push(IPoint);
                      bLine = new PolyLine();
                      bLine.value = inPolygon.outLine.value;
                      bLine.type = inPolygon.outLine.type;
                      bLine.pointList = newPlist;
                      newPolylines.push(bLine);
                      isInPolygon = false;
                      newPlist = [];
                  }
                  p1 = p2;
              }
          }
          if (newPolylines.length > 0) {
              //Tracing polygons
              newPolygons = Contour.tracingClipPolygons(inPolygon, newPolylines, borderList);
          }
          else if (pointInPolygonByPList(aPList, clipPList[0])) {
              var aBound = new Extent();
              var aPolygon = new Polygon();
              aPolygon.isBorder = true;
              aPolygon.lowValue = inPolygon.lowValue;
              aPolygon.highValue = inPolygon.highValue;
              aPolygon.area = getExtentAndArea(clipPList, aBound);
              aPolygon.isClockWise = true;
              //aPolygon.startPointIdx = lineBorderList.Count - 1;
              aPolygon.extent = aBound;
              aPolygon.outLine.pointList = clipPList;
              aPolygon.outLine.value = inPolygon.lowValue;
              aPolygon.isHighCenter = inPolygon.isHighCenter;
              aPolygon.outLine.type = 'Border';
              aPolygon.holeLines = [];
              newPolygons.push(aPolygon);
          }
          if (holeLines.length > 0) {
              Contour.addHoles_Ring(newPolygons, holeLines);
          }
          return newPolygons;
      };
      Contour.cutPolygon = function (inPolygon, clipPList) {
          var newPolygons = [];
          var newPolylines = [];
          var aPList = inPolygon.outLine.pointList;
          var plExtent = getExtent(aPList);
          var cutExtent = getExtent(clipPList);
          if (!isExtentCross(plExtent, cutExtent)) {
              return newPolygons;
          }
          var i, j;
          if (!isClockwise(clipPList)) {
              //---- Make cut polygon clockwise
              clipPList.reverse();
          }
          //Judge if all points of the polyline are in the cut polygon
          if (pointInPolygonByPList(clipPList, aPList[0])) {
              var isAllIn = true;
              var notInIdx = 0;
              for (i = 0; i < aPList.length; i++) {
                  if (!pointInPolygonByPList(clipPList, aPList[i])) {
                      notInIdx = i;
                      isAllIn = false;
                      break;
                  }
              }
              if (!isAllIn) {
                  //Put start point outside of the cut polygon
                  var bPList = [];
                  //bPList.AddRange(aPList.GetRange(notInIdx, aPList.Count - notInIdx));
                  //bPList.AddRange(aPList.GetRange(1, notInIdx - 1));
                  for (i = notInIdx; i < aPList.length; i++) {
                      bPList.push(aPList[i]);
                  }
                  for (i = 1; i < notInIdx; i++) {
                      bPList.push(aPList[i]);
                  }
                  bPList.push(bPList[0]);
                  aPList = [];
                  aPList.push.apply(aPList, bPList);
              } //the input polygon is inside the cut polygon
              else {
                  newPolygons.push(inPolygon);
                  return newPolygons;
              }
          }
          //Prepare border point list
          var borderList = [];
          var aBP = new BorderPoint();
          for (var _i = 0, clipPList_2 = clipPList; _i < clipPList_2.length; _i++) {
              var aP = clipPList_2[_i];
              aBP = new BorderPoint();
              aBP.point = aP;
              aBP.id = -1;
              borderList.push(aBP);
          }
          //Cutting
          var isInPolygon = false;
          var q1, q2, p1, p2, IPoint;
          var lineA, lineB;
          var newPlist = [];
          var bLine;
          p1 = aPList[0];
          var inIdx = -1, outIdx = -1;
          var a1 = 0;
          var isNewLine = true;
          for (i = 1; i < aPList.length; i++) {
              p2 = aPList[i];
              if (pointInPolygonByPList(clipPList, p2)) {
                  if (!isInPolygon) {
                      lineA = new Line();
                      lineA.P1 = p1;
                      lineA.P2 = p2;
                      q1 = borderList[borderList.length - 1].point;
                      IPoint = new PointD();
                      for (j = 0; j < borderList.length; j++) {
                          q2 = borderList[j].point;
                          lineB = new Line();
                          lineB.P1 = q1;
                          lineB.P2 = q2;
                          if (isLineSegmentCross(lineA, lineB)) {
                              IPoint = Contour.getCrossPointD(lineA, lineB);
                              aBP = new BorderPoint();
                              aBP.id = newPolylines.length;
                              aBP.point = IPoint;
                              borderList.splice(j, 0, aBP);
                              inIdx = j;
                              break;
                          }
                          q1 = q2;
                      }
                      newPlist.push(IPoint);
                  }
                  newPlist.push(aPList[i]);
                  isInPolygon = true;
              }
              else if (isInPolygon) {
                  lineA = new Line();
                  lineA.P1 = p1;
                  lineA.P2 = p2;
                  q1 = borderList[borderList.length - 1].point;
                  IPoint = new PointD();
                  for (j = 0; j < borderList.length; j++) {
                      q2 = borderList[j].point;
                      lineB = new Line();
                      lineB.P1 = q1;
                      lineB.P2 = q2;
                      if (isLineSegmentCross(lineA, lineB)) {
                          if (!isNewLine) {
                              if (inIdx - outIdx >= 1 && inIdx - outIdx <= 10) {
                                  if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                                      borderList.splice(inIdx, 1);
                                      borderList.splice(outIdx, 0, aBP);
                                  }
                              }
                              else if (inIdx - outIdx <= -1 && inIdx - outIdx >= -10) {
                                  if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                                      borderList.splice(inIdx, 1);
                                      borderList.splice(outIdx + 1, 0, aBP);
                                  }
                              }
                              else if (inIdx === outIdx) {
                                  if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                                      borderList.splice(inIdx, 1);
                                      borderList.splice(inIdx + 1, 0, aBP);
                                  }
                              }
                          }
                          IPoint = Contour.getCrossPointD(lineA, lineB);
                          aBP = new BorderPoint();
                          aBP.id = newPolylines.length;
                          aBP.point = IPoint;
                          borderList.splice(j, 0, aBP);
                          outIdx = j;
                          a1 = inIdx;
                          isNewLine = false;
                          break;
                      }
                      q1 = q2;
                  }
                  newPlist.push(IPoint);
                  bLine = new PolyLine();
                  bLine.value = inPolygon.outLine.value;
                  bLine.type = inPolygon.outLine.type;
                  bLine.pointList = newPlist;
                  newPolylines.push(bLine);
                  isInPolygon = false;
                  newPlist = [];
              }
              p1 = p2;
          }
          if (newPolylines.length > 0) {
              //Tracing polygons
              newPolygons = Contour.tracingClipPolygons(inPolygon, newPolylines, borderList);
          }
          else if (pointInPolygonByPList(aPList, clipPList[0])) {
              var aBound = new Extent();
              var aPolygon = new Polygon();
              aPolygon.isBorder = true;
              aPolygon.lowValue = inPolygon.lowValue;
              aPolygon.highValue = inPolygon.highValue;
              aPolygon.area = getExtentAndArea(clipPList, aBound);
              aPolygon.isClockWise = true;
              //aPolygon.startPointIdx = lineBorderList.Count - 1;
              aPolygon.extent = aBound;
              aPolygon.outLine.pointList = clipPList;
              aPolygon.outLine.value = inPolygon.lowValue;
              aPolygon.isHighCenter = inPolygon.isHighCenter;
              aPolygon.outLine.type = 'Border';
              aPolygon.holeLines = [];
              newPolygons.push(aPolygon);
          }
          return newPolygons;
      };
      Contour.twoPointsInside = function (a1, a2, b1, b2) {
          if (a2 < a1) {
              a1 += 1;
          }
          if (b1 < a1) {
              a1 += 1;
          }
          if (b1 < a2) {
              a2 += 1;
          }
          if (a2 < a1) {
              var c = a1;
              a1 = a2;
              a2 = c;
          }
          if (b1 > a1 && b1 <= a2) {
              if (b2 > a1 && b2 <= a2) {
                  return true;
              }
              else {
                  return false;
              }
          }
          else if (!(b2 > a1 && b2 <= a2)) {
              return true;
          }
          else {
              return false;
          }
      };
      // </editor-fold>
      // <editor-fold desc="Streamline">
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
      Contour.tracingStreamline = function (U, V, X, Y, UNDEF, density) {
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
                          var isInDomain = Contour.tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, true);
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
                                              dis = Contour.distance_point2line(pointStart.point, pointEnd.point, aPoint);
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
                          var isInDomain = Contour.tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, false);
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
                                              dis = Contour.distance_point2line(pointStart.point, pointEnd.point, aPoint);
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
      Contour.tracingStreamlinePoint = function (aPoint, Dx, Dy, X, Y, iijj, isForward) {
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
      };
      Contour.distance_point2line = function (pt1, pt2, point) {
          var k = (pt2.y - pt1.y) / (pt2.x - pt1.x);
          var x = (k * k * pt1.x + k * (point.y - pt1.y) + point.x) / (k * k + 1);
          var y = k * (x - pt1.x) + pt1.y;
          var dis = Math.sqrt((point.y - y) * (point.y - y) + (point.x - x) * (point.x - x));
          return dis;
      };
      /**
       * Get cross point of two line segments
       *
       * @param aP1 point 1 of line a
       * @param aP2 point 2 of line a
       * @param bP1 point 1 of line b
       * @param bP2 point 2 of line b
       * @return cross point
       */
      Contour.getCrossPointF = function (aP1, aP2, bP1, bP2) {
          var IPoint = new PointD(0, 0);
          var p1, p2, q1, q2;
          var tempLeft, tempRight;
          var XP1 = (bP1.x - aP1.x) * (aP2.y - aP1.y) - (aP2.x - aP1.x) * (bP1.y - aP1.y);
          var XP2 = (bP2.x - aP1.x) * (aP2.y - aP1.y) - (aP2.x - aP1.x) * (bP2.y - aP1.y);
          if (XP1 === 0) {
              IPoint = bP1;
          }
          else if (XP2 === 0) {
              IPoint = bP2;
          }
          else {
              p1 = aP1;
              p2 = aP2;
              q1 = bP1;
              q2 = bP2;
              tempLeft = (q2.x - q1.x) * (p1.y - p2.y) - (p2.x - p1.x) * (q1.y - q2.y);
              tempRight =
                  (p1.y - q1.y) * (p2.x - p1.x) * (q2.x - q1.x) +
                      q1.x * (q2.y - q1.y) * (p2.x - p1.x) -
                      p1.x * (p2.y - p1.y) * (q2.x - q1.x);
              IPoint.x = tempRight / tempLeft;
              tempLeft = (p1.x - p2.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q1.x - q2.x);
              tempRight =
                  p2.y * (p1.x - p2.x) * (q2.y - q1.y) +
                      (q2.x - p2.x) * (q2.y - q1.y) * (p1.y - p2.y) -
                      q2.y * (q1.x - q2.x) * (p2.y - p1.y);
              IPoint.y = tempRight / tempLeft;
          }
          return IPoint;
      };
      Contour.getCrossPointD = function (lineA, lineB) {
          var IPoint = new PointD();
          var p1, p2, q1, q2;
          var tempLeft, tempRight;
          var XP1 = (lineB.P1.x - lineA.P1.x) * (lineA.P2.y - lineA.P1.y) -
              (lineA.P2.x - lineA.P1.x) * (lineB.P1.y - lineA.P1.y);
          var XP2 = (lineB.P2.x - lineA.P1.x) * (lineA.P2.y - lineA.P1.y) -
              (lineA.P2.x - lineA.P1.x) * (lineB.P2.y - lineA.P1.y);
          if (XP1 === 0) {
              IPoint = lineB.P1;
          }
          else if (XP2 === 0) {
              IPoint = lineB.P2;
          }
          else {
              p1 = lineA.P1;
              p2 = lineA.P2;
              q1 = lineB.P1;
              q2 = lineB.P2;
              tempLeft = (q2.x - q1.x) * (p1.y - p2.y) - (p2.x - p1.x) * (q1.y - q2.y);
              tempRight =
                  (p1.y - q1.y) * (p2.x - p1.x) * (q2.x - q1.x) +
                      q1.x * (q2.y - q1.y) * (p2.x - p1.x) -
                      p1.x * (p2.y - p1.y) * (q2.x - q1.x);
              IPoint.x = tempRight / tempLeft;
              tempLeft = (p1.x - p2.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q1.x - q2.x);
              tempRight =
                  p2.y * (p1.x - p2.x) * (q2.y - q1.y) +
                      (q2.x - p2.x) * (q2.y - q1.y) * (p1.y - p2.y) -
                      q2.y * (q1.x - q2.x) * (p2.y - p1.y);
              IPoint.y = tempRight / tempLeft;
          }
          return IPoint;
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
      Contour.insertPoint2RectangleBorder = function (LineList, aBound) {
          var bPoint, bP;
          var aLine;
          var aPoint;
          var i, j, k;
          var LBPList = [], TBPList = [];
          var RBPList = [], BBPList = [];
          var BorderList = [];
          var aPointList;
          var IsInserted;
          //---- Get four border point list
          for (i = 0; i < LineList.length; i++) {
              aLine = LineList[i];
              if (!('Close' === aLine.type)) {
                  aPointList = [];
                  aPointList.push.apply(aPointList, aLine.pointList);
                  bP = new BorderPoint();
                  bP.id = i;
                  for (k = 0; k <= 1; k++) {
                      if (k === 0) {
                          aPoint = aPointList[0];
                      }
                      else {
                          aPoint = aPointList[aPointList.length - 1];
                      }
                      bP.point = aPoint;
                      IsInserted = false;
                      if (aPoint.x === aBound.xMin) {
                          for (j = 0; j < LBPList.length; j++) {
                              bPoint = LBPList[j];
                              if (aPoint.y < bPoint.point.y) {
                                  LBPList.splice(j, 0, bP);
                                  IsInserted = true;
                                  break;
                              }
                          }
                          if (!IsInserted) {
                              LBPList.push(bP);
                          }
                      }
                      else if (aPoint.x === aBound.xMax) {
                          for (j = 0; j < RBPList.length; j++) {
                              bPoint = RBPList[j];
                              if (aPoint.y > bPoint.point.y) {
                                  RBPList.splice(j, 0, bP);
                                  IsInserted = true;
                                  break;
                              }
                          }
                          if (!IsInserted) {
                              RBPList.push(bP);
                          }
                      }
                      else if (aPoint.y === aBound.yMin) {
                          for (j = 0; j < BBPList.length; j++) {
                              bPoint = BBPList[j];
                              if (aPoint.x > bPoint.point.x) {
                                  BBPList.splice(j, 0, bP);
                                  IsInserted = true;
                                  break;
                              }
                          }
                          if (!IsInserted) {
                              BBPList.push(bP);
                          }
                      }
                      else if (aPoint.y === aBound.yMax) {
                          for (j = 0; j < TBPList.length; j++) {
                              bPoint = TBPList[j];
                              if (aPoint.x < bPoint.point.x) {
                                  TBPList.splice(j, 0, bP);
                                  IsInserted = true;
                                  break;
                              }
                          }
                          if (!IsInserted) {
                              TBPList.push(bP);
                          }
                      }
                  }
              }
          }
          //---- Get border list
          bP = new BorderPoint();
          bP.id = -1;
          aPoint = new PointD();
          aPoint.x = aBound.xMin;
          aPoint.y = aBound.yMin;
          bP.point = aPoint;
          BorderList.push(bP);
          BorderList.push.apply(BorderList, LBPList);
          bP = new BorderPoint();
          bP.id = -1;
          aPoint = new PointD();
          aPoint.x = aBound.xMin;
          aPoint.y = aBound.yMax;
          bP.point = aPoint;
          BorderList.push(bP);
          BorderList.push.apply(BorderList, TBPList);
          bP = new BorderPoint();
          bP.id = -1;
          aPoint = new PointD();
          aPoint.x = aBound.xMax;
          aPoint.y = aBound.yMax;
          bP.point = aPoint;
          BorderList.push(bP);
          BorderList.push.apply(BorderList, RBPList);
          bP = new BorderPoint();
          bP.id = -1;
          aPoint = new PointD();
          aPoint.x = aBound.xMax;
          aPoint.y = aBound.yMin;
          bP.point = aPoint;
          BorderList.push(bP);
          BorderList.push.apply(BorderList, BBPList);
          BorderList.push(BorderList[0]);
          return BorderList;
      };
      Contour.insertEndPoint2Border = function (EPList, aBorderList) {
          var aBPoint, bP;
          var i, j, k;
          var p1, p2;
          var aEPList;
          var temEPList = [];
          var dList = [];
          var aEP;
          var dist;
          var IsInsert;
          var BorderList = [];
          aEPList = [];
          aEPList.push.apply(aEPList, EPList);
          aBPoint = aBorderList[0];
          p1 = aBPoint.point;
          BorderList.push(aBPoint);
          for (i = 1; i < aBorderList.length; i++) {
              aBPoint = aBorderList[i];
              p2 = aBPoint.point;
              temEPList = [];
              for (j = 0; j < aEPList.length; j++) {
                  if (j === aEPList.length) {
                      break;
                  }
                  aEP = aEPList[j];
                  if (Math.abs(aEP.sPoint.x - p1.x) < 0.000001 && Math.abs(aEP.sPoint.y - p1.y) < 0.000001) {
                      temEPList.push(aEP);
                      aEPList.splice(j, 1);
                      //aEPList.remove(j);
                      j -= 1;
                  }
              }
              if (temEPList.length > 0) {
                  dList = [];
                  if (temEPList.length > 1) {
                      for (j = 0; j < temEPList.length; j++) {
                          aEP = temEPList[j];
                          dist = Math.pow(aEP.point.x - p1.x, 2) + Math.pow(aEP.point.y - p1.y, 2);
                          if (j === 0) {
                              dList.push([dist, j]);
                          }
                          else {
                              IsInsert = false;
                              for (k = 0; k < dList.length; k++) {
                                  if (dist < parseFloat(dList[k][0])) {
                                      dList.splice(k, 0, [dist, j]);
                                      IsInsert = true;
                                      break;
                                  }
                              }
                              if (!IsInsert) {
                                  dList.push([dist, j]);
                              }
                          }
                      }
                      for (j = 0; j < dList.length; j++) {
                          aEP = temEPList[parseInt(dList[j][1])];
                          bP = new BorderPoint();
                          bP.id = aEP.index;
                          bP.point = aEP.point;
                          BorderList.push(bP);
                      }
                  }
                  else {
                      aEP = temEPList[0];
                      bP = new BorderPoint();
                      bP.id = aEP.index;
                      bP.point = aEP.point;
                      BorderList.push(bP);
                  }
              }
              BorderList.push(aBPoint);
              p1 = p2;
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

  var uti = {
      smoothLines: smoothLines,
  };

  exports.Contour = Contour;
  exports.uti = uti;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
