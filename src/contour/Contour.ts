import Border from './global/Border'
import BorderLine from './global/BorderLine'
import BorderPoint from './global/BorderPoint'
import EndPoint from './global/EndPoint'
import Extent from './global/Extent'
import IJPoint from './global/IJPoint'
import Line from './global/Line'
import PointD from './global/PointD'
import Polygon from './global/Polygon'
import PolyLine from './global/PolyLine'
import {
  canTraceBorder,
  canTraceIsoline_UndefData,
  tracingClipPolygons,
  tracingPolygons_Ring,
  tracingStreamlinePoint,
} from './utils/trace'
import * as uti from './utils/uti'

export default class Contour {
  private static _endPointList: EndPoint[] = []
  // _s0: grid data are from left to right and from bottom to top,
  // first dimention is y, second dimention is x
  private _s0: number[][]
  private _m: number // y
  private _n: number // x
  private _xs: number[]
  private _ys: number[]
  private _undefData: number
  private _s1: number[][] // data flag
  private _borders: Border[] = []

  constructor(s0: number[][], xs: number[], ys: number[], undefData?: number) {
    this._s0 = s0 //
    this._m = s0.length // y
    this._n = s0[0].length // x
    this._xs = xs
    this._ys = ys
    this._undefData = undefData
    this._s1 = this._tracingDataFlag()
    this._borders = this._tracingBorders()
  }

  /**
   * tracing data flag array of the grid data.
   */
  private _tracingDataFlag(): number[][] {
    let s1: number[][] = []
    const { _s0, _m, _n, _undefData } = this
    // Generate data flag array
    // 1. 0 with undefine data, 1 with data
    for (let i = 0; i < _m; i++) {
      s1[i] = []
      for (let j = 0; j < _n; j++) {
        s1[i][j] = uti.doubleEquals(_s0[i][j], _undefData) ? 0 : 1
      }
    }
    // 2. data flag array: border points are 1, undefine points are 0, inside data points are 2
    for (let i = 1; i < _m - 1; i++) {
      for (let j = 1; j < _n - 1; j++) {
        if (s1[i][j] === 1) {
          // l - Left; r - Right; b - Bottom; t - Top;
          // lb - LeftBottom; rb - RightBottom; lt - LeftTop; rt - RightTop
          let l = s1[i][j - 1]
          let r = s1[i][j + 1]
          let b = s1[i - 1][j]
          let t = s1[i + 1][j]
          let lb = s1[i - 1][j - 1]
          let rb = s1[i - 1][j + 1]
          let lt = s1[i + 1][j - 1]
          let rt = s1[i + 1][j + 1]

          if (l > 0 && r > 0 && b > 0 && t > 0 && lb > 0 && rb > 0 && lt > 0 && rt > 0) {
            // inside data point
            s1[i][j] = 2
          }
          if (l + r + b + t + lb + rb + lt + rt <= 2) {
            // data point, but not more than 3 continued data points together.
            // so they can't be traced as a border (at least 4 points together).
            s1[i][j] = 0
          }
        }
      }
    }

    // 3. remove isolated data points (up, down, left and right points are all undefine data).
    let isContinue: boolean
    while (true) {
      isContinue = false
      for (let i = 1; i < _m - 1; i++) {
        for (let j = 1; j < _n - 1; j++) {
          if (s1[i][j] === 1) {
            let l = s1[i][j - 1]
            let r = s1[i][j + 1]
            let b = s1[i - 1][j]
            let t = s1[i + 1][j]
            let lb = s1[i - 1][j - 1]
            let rb = s1[i - 1][j + 1]
            let lt = s1[i + 1][j - 1]
            let rt = s1[i + 1][j + 1]
            if ((l === 0 && r === 0) || (b === 0 && t === 0)) {
              // up, down, left and right points are all undefine data
              s1[i][j] = 0
              isContinue = true
            }
            if (
              (lt === 0 && r === 0 && b === 0) ||
              (rt === 0 && l === 0 && b === 0) ||
              (lb === 0 && r === 0 && t === 0) ||
              (rb === 0 && l === 0 && t === 0)
            ) {
              s1[i][j] = 0
              isContinue = true
            }
          }
        }
      }
      if (!isContinue) {
        // untile no more isolated data point.
        break
      }
    }
    // 4. deal with grid data border points
    // top and bottom border points
    for (let j = 0; j < _n; j++) {
      if (s1[0][j] === 1) {
        if (s1[1][j] === 0) {
          // up point is undefine
          s1[0][j] = 0
        } else if (j === 0) {
          if (s1[0][j + 1] === 0) {
            s1[0][j] = 0
          }
        } else if (j === _n - 1) {
          if (s1[0][_n - 2] === 0) {
            s1[0][j] = 0
          }
        } else if (s1[0][j - 1] === 0 && s1[0][j + 1] === 0) {
          s1[0][j] = 0
        }
      }
      if (s1[_m - 1][j] === 1) {
        if (s1[_m - 2][j] === 0) {
          // down point is undefine
          s1[_m - 1][j] = 0
        } else if (j === 0) {
          if (s1[_m - 1][j + 1] === 0) {
            s1[_m - 1][j] = 0
          }
        } else if (j === _n - 1) {
          if (s1[_m - 1][_n - 2] === 0) {
            s1[_m - 1][j] = 0
          }
        } else if (s1[_m - 1][j - 1] === 0 && s1[_m - 1][j + 1] === 0) {
          s1[_m - 1][j] = 0
        }
      }
    }
    // left and right border points
    for (let i = 0; i < _m; i++) {
      if (s1[i][0] === 1) {
        if (s1[i][1] === 0) {
          // right point is undefine
          s1[i][0] = 0
        } else if (i === 0) {
          if (s1[i + 1][0] === 0) {
            s1[i][0] = 0
          }
        } else if (i === _m - 1) {
          if (s1[_m - 2][0] === 0) {
            s1[i][0] = 0
          }
        } else if (s1[i - 1][0] === 0 && s1[i + 1][0] === 0) {
          s1[i][0] = 0
        }
      }
      if (s1[i][_n - 1] === 1) {
        if (s1[i][_n - 2] === 0) {
          // left point is undefine
          s1[i][_n - 1] = 0
        } else if (i === 0) {
          if (s1[i + 1][_n - 1] === 0) {
            s1[i][_n - 1] = 0
          }
        } else if (i === _m - 1) {
          if (s1[_m - 2][_n - 1] === 0) {
            s1[i][_n - 1] = 0
          }
        } else if (s1[i - 1][_n - 1] === 0 && s1[i + 1][_n - 1] === 0) {
          s1[i][_n - 1] = 0
        }
      }
    }
    return s1
  }

  /**
   * tracing contour borders of the grid data with data flag.
   */
  private _tracingBorders(): Border[] {
    const { _s1, _m, _n, _xs, _ys } = this

    let borderLines: BorderLine[] = []
    // generate s2 from s1, add border to s2 with undefine data.
    let s2: number[][] = []
    for (let i = 0; i < _m + 2; i++) {
      s2[i] = []
      for (let j = 0; j < _n + 2; j++) {
        if (i === 0 || i === _m + 1) {
          // bottom or top border
          s2[i][j] = 0
        } else if (j === 0 || j === _n + 1) {
          // left or right border
          s2[i][j] = 0
        } else {
          s2[i][j] = _s1[i - 1][j - 1]
        }
      }
    }

    // using times number of each point during chacing process.
    let uNum: number[][] = []
    for (let i = 0; i < _m + 2; i++) {
      uNum[i] = []
      for (let j = 0; j < _n + 2; j++) {
        if (s2[i][j] === 1) {
          let l = s2[i][j - 1]
          let r = s2[i][j + 1]
          let b = s2[i - 1][j]
          let t = s2[i + 1][j]
          let lb = s2[i - 1][j - 1]
          let rb = s2[i - 1][j + 1]
          let lt = s2[i + 1][j - 1]
          let rt = s2[i + 1][j + 1]
          // cross point with two boder lines, will be used twice.
          if (
            l === 1 &&
            r === 1 &&
            b === 1 &&
            t === 1 &&
            ((lb === 0 && rt === 0) || (rb === 0 && lt === 0))
          ) {
            uNum[i][j] = 2
          } else {
            uNum[i][j] = 1
          }
        } else {
          uNum[i][j] = 0
        }
      }
    }

    // tracing borderlines
    for (let i = 1; i < _m + 1; i++) {
      for (let j = 1; j < _n + 1; j++) {
        if (s2[i][j] === 1) {
          // tracing border from any border point
          let pointList: PointD[] = []
          let ijPList: IJPoint[] = []
          pointList.push(new PointD(_xs[j - 1], _ys[i - 1]))
          ijPList.push(new IJPoint(i - 1, j - 1))
          let i3 = 0
          let j3 = 0
          let i2 = i
          let j2 = j
          let i1 = i2
          let j1 = -1 // Trace from left firstly

          while (true) {
            let ij3: number[] = []
            ij3[0] = i3
            ij3[1] = j3
            if (canTraceBorder(s2, i1, i2, j1, j2, ij3)) {
              i3 = ij3[0]
              j3 = ij3[1]
              i1 = i2
              j1 = j2
              i2 = i3
              j2 = j3
              uNum[i3][j3] = uNum[i3][j3] - 1
              if (uNum[i3][j3] === 0) {
                s2[i3][j3] = 3 //Used border point
              }
            } else {
              break
            }

            pointList.push(new PointD(_xs[j3 - 1], _ys[i3 - 1]))
            ijPList.push(new IJPoint(i3 - 1, j3 - 1))
            if (i3 === i && j3 === j) {
              break
            }
          }
          uNum[i][j] = uNum[i][j] - 1
          if (uNum[i][j] === 0) {
            s2[i][j] = 3 //Used border point
          } //uNum[i][j] = uNum[i][j] - 1;
          if (pointList.length > 1) {
            let aBLine = new BorderLine()
            aBLine.area = uti.getExtentAndArea(pointList, aBLine.extent)
            aBLine.isOutLine = true
            aBLine.isClockwise = true
            aBLine.pointList = pointList
            aBLine.ijPointList = ijPList
            borderLines.push(aBLine)
          }
        }
      }
    }

    // Form borders
    let borders: Border[] = []
    // Sort borderlines with area from small to big.
    // For inside border line analysis
    for (let i = 1; i < borderLines.length; i++) {
      const aLine = borderLines[i]
      for (let j = 0; j < i; j++) {
        const bLine = borderLines[i]
        if (aLine.area > bLine.area) {
          borderLines.splice(i, 1)
          borderLines.splice(j, 0, aLine)
          break
        }
      }
    }
    let lineList: BorderLine[]
    if (borderLines.length === 1) {
      // Only one boder line
      const aLine = borderLines[0]
      if (!uti.isClockwise(aLine.pointList)) {
        aLine.pointList = aLine.pointList.reverse()
        aLine.ijPointList.reverse()
      }
      aLine.isClockwise = true
      lineList = []
      lineList.push(aLine)
      let aBorder = new Border()
      aBorder.lineList = lineList
      borders.push(aBorder)
    } else {
      // muti border lines
      for (let i = 0; i < borderLines.length; i++) {
        if (i === borderLines.length) {
          break
        }
        const aLine = borderLines[i]
        if (!uti.isClockwise(aLine.pointList)) {
          aLine.pointList.reverse()
          aLine.ijPointList.reverse()
        }
        aLine.isClockwise = true
        lineList = []
        lineList.push(aLine)
        // Try to find the boder lines are inside of aLine.
        for (let j = i + 1; j < borderLines.length; j++) {
          if (j === borderLines.length) {
            break
          }
          const bLine = borderLines[i]
          if (
            bLine.extent.xMin > aLine.extent.xMin &&
            bLine.extent.xMax < aLine.extent.xMax &&
            bLine.extent.yMin > aLine.extent.yMin &&
            bLine.extent.yMax < aLine.extent.yMax
          ) {
            const aPoint = bLine.pointList[0]
            if (uti.pointInPolygonByPList(aLine.pointList, aPoint)) {
              // bLine is inside of aLine
              bLine.isOutLine = false
              if (uti.isClockwise(bLine.pointList)) {
                bLine.pointList.reverse()
                bLine.ijPointList.reverse()
              }
              bLine.isClockwise = false
              lineList.push(bLine)
              borderLines.splice(j, 1)
              j = j - 1
            }
          }
        }
        let aBorder = new Border()
        aBorder.lineList = lineList
        borders.push(aBorder)
      }
    }
    return borders
  }

  /**
   * Tracing contour lines from the grid data with undefine data
   *
   * @param contour contour value array
   * @return contour line list
   */
  public tracingContourLines(contour: number[]): PolyLine[] {
    const { _s0, _s1, _xs, _ys, _m, _n, _borders, _undefData } = this

    let contourLineList: PolyLine[] = []
    let cLineList: PolyLine[]
    // Add a small value to aviod the contour point as same as data point
    let dShift = contour[0] * 0.00001
    if (dShift === 0) {
      dShift = 0.00001
    }
    for (let i = 0; i < _m; i++) {
      for (let j = 0; j < _n; j++) {
        if (!uti.doubleEquals(_s0[i][j], _undefData)) {
          _s0[i][j] = _s0[i][j] + dShift
        }
      }
    }

    // Define if H S are border
    let SB: number[][][] = []
    let HB: number[][][] = [] // Which border and trace direction
    SB[0] = []
    SB[1] = []
    HB[0] = []
    HB[1] = []
    for (let i = 0; i < _m; i++) {
      SB[0][i] = []
      SB[1][i] = []
      HB[0][i] = []
      HB[1][i] = []
      for (let j = 0; j < _n; j++) {
        if (j < _n - 1) {
          SB[0][i][j] = -1
          SB[1][i][j] = -1
        }
        if (i < _m - 1) {
          HB[0][i][j] = -1
          HB[1][i][j] = -1
        }
      }
    }
    let k: number, si: number, sj: number
    let aijP: IJPoint, bijP: IJPoint
    for (let i = 0; i < _borders.length; i++) {
      const aBorder = _borders[i]
      for (let j = 0; j < aBorder.getLineNum(); j++) {
        const aBLine = aBorder.lineList[j]
        const ijPList = aBLine.ijPointList
        for (k = 0; k < ijPList.length - 1; k++) {
          aijP = ijPList[k]
          bijP = ijPList[k + 1]
          if (aijP.i === bijP.i) {
            si = aijP.i
            sj = Math.min(aijP.j, bijP.j)
            SB[0][si][sj] = i
            if (bijP.j > aijP.j) {
              // Trace from top
              SB[1][si][sj] = 1
            } else {
              // Trace from bottom
              SB[1][si][sj] = 0
            }
          } else {
            sj = aijP.j
            si = Math.min(aijP.i, bijP.i)
            HB[0][si][sj] = i
            if (bijP.i > aijP.i) {
              // Trace from left
              HB[1][si][sj] = 0
            } else {
              // Trace from right
              HB[1][si][sj] = 1
            }
          }
        }
      }
    }

    //---- Define horizontal and vertical arrays with the position of the tracing value, -2 means no tracing point.
    let S: number[][] = []
    let H: number[][] = []
    let w: number //---- Tracing value
    let c: number
    //ArrayList _endPointList = new ArrayList();    //---- Contour line end points for insert to border
    for (c = 0; c < contour.length; c++) {
      w = contour[c]
      for (let i = 0; i < _m; i++) {
        S[i] = []
        H[i] = []
        for (let j = 0; j < _n; j++) {
          if (j < _n - 1) {
            if (_s1[i][j] !== 0 && _s1[i][j + 1] !== 0) {
              if ((_s0[i][j] - w) * (_s0[i][j + 1] - w) < 0) {
                //---- Has tracing value
                S[i][j] = (w - _s0[i][j]) / (_s0[i][j + 1] - _s0[i][j])
              } else {
                S[i][j] = -2
              }
            } else {
              S[i][j] = -2
            }
          }
          if (i < _m - 1) {
            if (_s1[i][j] !== 0 && _s1[i + 1][j] !== 0) {
              if ((_s0[i][j] - w) * (_s0[i + 1][j] - w) < 0) {
                //---- Has tracing value
                H[i][j] = (w - _s0[i][j]) / (_s0[i + 1][j] - _s0[i][j])
              } else {
                H[i][j] = -2
              }
            } else {
              H[i][j] = -2
            }
          }
        }
      }

      cLineList = Contour.isoline_UndefData(_s0, _xs, _ys, w, S, H, SB, HB, contourLineList.length)
      for (let ln of cLineList) {
        contourLineList.push(ln)
      }
    }

    //---- Set border index for close contours
    for (let i = 0; i < _borders.length; i++) {
      const aBorder = _borders[i]
      const aBLine = aBorder.lineList[0]
      for (let j = 0; j < contourLineList.length; j++) {
        const aLine = contourLineList[j]
        if (aLine.type === 'Close') {
          const aPoint = aLine.pointList[0]
          if (uti.pointInPolygonByPList(aBLine.pointList, aPoint)) {
            aLine.borderIdx = i
          }
        }
        contourLineList.splice(j, 1)
        contourLineList.splice(j, 0, aLine)
      }
    }
    return contourLineList
  }

  /**
   * Tracing polygons from contour lines and borders
   *
   * @param cLineList contour lines
   * @param contour contour values
   */
  public tracingPolygons(cLineList: PolyLine[], contour: number[]): Polygon[] {
    const S0 = this._s0
    const borderList = this._borders
    let aPolygonList: Polygon[] = []
    let newPolygonList: Polygon[] = []
    let newBPList: BorderPoint[]
    let bPList: BorderPoint[] = []
    let PList: PointD[]
    let aBorder: Border
    let aBLine: BorderLine
    let aPoint: PointD
    let aBPoint: BorderPoint
    let i: number, j: number
    let lineList: PolyLine[] = []
    let aBorderList: BorderPoint[] = []
    let aLine: PolyLine
    let aPolygon: Polygon
    let aijP: IJPoint
    let aValue: number = 0
    let pNums: number[]

    //Borders loop
    for (i = 0; i < borderList.length; i++) {
      aBorderList = []
      bPList = []
      lineList = []
      aPolygonList = []
      aBorder = borderList[i]

      aBLine = aBorder.lineList[0]
      PList = aBLine.pointList
      if (!uti.isClockwise(PList)) {
        //Make sure the point list is clockwise
        PList.reverse()
      }

      if (aBorder.getLineNum() === 1) {
        //The border has just one line
        //Construct border point list
        for (j = 0; j < PList.length; j++) {
          aPoint = PList[j]
          aBPoint = new BorderPoint()
          aBPoint.id = -1
          aBPoint.point = aPoint
          aBPoint.value = S0[aBLine.ijPointList[j].i][aBLine.ijPointList[j].j]
          aBorderList.push(aBPoint)
        }

        //Find the contour lines of this border
        for (j = 0; j < cLineList.length; j++) {
          aLine = cLineList[j]
          if (aLine.borderIdx === i) {
            lineList.push(aLine) //Construct contour line list
            //Construct border point list of the contour line
            if (aLine.type === 'Border') {
              //The contour line with the start/end point on the border
              aPoint = aLine.pointList[0]
              aBPoint = new BorderPoint()
              aBPoint.id = lineList.length - 1
              aBPoint.point = aPoint
              aBPoint.value = aLine.value
              bPList.push(aBPoint)
              aPoint = aLine.pointList[aLine.pointList.length - 1]
              aBPoint = new BorderPoint()
              aBPoint.id = lineList.length - 1
              aBPoint.point = aPoint
              aBPoint.value = aLine.value
              bPList.push(aBPoint)
            }
          }
        }

        if (lineList.length === 0) {
          //No contour lines in this border, the polygon is the border
          //Judge the value of the polygon
          aijP = aBLine.ijPointList[0]
          aPolygon = new Polygon()
          if (S0[aijP.i][aijP.j] < contour[0]) {
            aValue = contour[0]
            aPolygon.isHighCenter = false
          } else {
            for (j = contour.length - 1; j >= 0; j--) {
              if (S0[aijP.i][aijP.j] > contour[j]) {
                aValue = contour[j]
                break
              }
            }
            aPolygon.isHighCenter = true
          }
          if (PList.length > 0) {
            aPolygon.isBorder = true
            aPolygon.highValue = aValue
            aPolygon.lowValue = aValue
            aPolygon.extent = new Extent()
            aPolygon.area = uti.getExtentAndArea(PList, aPolygon.extent)
            aPolygon.startPointIdx = 0
            aPolygon.isClockWise = true
            aPolygon.outLine.type = 'Border'
            aPolygon.outLine.value = aValue
            aPolygon.outLine.borderIdx = i
            aPolygon.outLine.pointList = PList
            aPolygon.holeLines = []
            aPolygonList.push(aPolygon)
          }
        } //Has contour lines in this border
        else {
          //Insert the border points of the contour lines to the border point list of the border
          if (bPList.length > 0) {
            newBPList = Contour.insertPoint2Border(bPList, aBorderList)
          } else {
            newBPList = aBorderList
          }
          //aPolygonList = TracingPolygons(lineList, newBPList, aBound, contour);
          aPolygonList = Contour.tracingPolygons_Line_Border(lineList, newBPList)
        }
        aPolygonList = Contour.addPolygonHoles(aPolygonList)
      } //---- The border has holes
      else {
        aBLine = aBorder.lineList[0]
        //Find the contour lines of this border
        for (j = 0; j < cLineList.length; j++) {
          aLine = cLineList[j]
          if (aLine.borderIdx === i) {
            lineList.push(aLine)
            if (aLine.type === 'Border') {
              aPoint = aLine.pointList[0]
              aBPoint = new BorderPoint()
              aBPoint.id = lineList.length - 1
              aBPoint.point = aPoint
              aBPoint.value = aLine.value
              bPList.push(aBPoint)
              aPoint = aLine.pointList[aLine.pointList.length - 1]
              aBPoint = new BorderPoint()
              aBPoint.id = lineList.length - 1
              aBPoint.point = aPoint
              aBPoint.value = aLine.value
              bPList.push(aBPoint)
            }
          }
        }
        if (lineList.length === 0) {
          //No contour lines in this border, the polygon is the border and the holes
          aijP = aBLine.ijPointList[0]
          aPolygon = new Polygon()
          if (S0[aijP.i][aijP.j] < contour[0]) {
            aValue = contour[0]
            aPolygon.isHighCenter = false
          } else {
            for (j = contour.length - 1; j >= 0; j--) {
              if (S0[aijP.i][aijP.j] > contour[j]) {
                aValue = contour[j]
                break
              }
            }
            aPolygon.isHighCenter = true
          }
          if (PList.length > 0) {
            aPolygon.isBorder = true
            aPolygon.highValue = aValue
            aPolygon.lowValue = aValue
            aPolygon.area = uti.getExtentAndArea(PList, aPolygon.extent)
            aPolygon.startPointIdx = 0
            aPolygon.isClockWise = true
            aPolygon.outLine.type = 'Border'
            aPolygon.outLine.value = aValue
            aPolygon.outLine.borderIdx = i
            aPolygon.outLine.pointList = PList
            aPolygon.holeLines = []
            aPolygonList.push(aPolygon)
          }
        } else {
          pNums = []
          pNums.length = aBorder.getLineNum()
          newBPList = Contour.insertPoint2Border_Ring(S0, bPList, aBorder, pNums)

          aPolygonList = tracingPolygons_Ring(lineList, newBPList, aBorder, contour, pNums)
          //aPolygonList = TracingPolygons(lineList, newBPList, contour);

          //Sort polygons by area
          let sortList: Polygon[] = []
          while (aPolygonList.length > 0) {
            let isInsert: boolean = false
            for (j = 0; j < sortList.length; j++) {
              if (aPolygonList[0].area > sortList[j].area) {
                sortList.push(aPolygonList[0])
                isInsert = true
                break
              }
            }
            if (!isInsert) {
              sortList.push(aPolygonList[0])
            }
            aPolygonList.splice(0, 1)
          }
          aPolygonList = sortList
        }
        let holeList: PointD[][] = []
        for (j = 0; j < aBorder.getLineNum(); j++) {
          //let tempList = [];
          //for (let p of aBorder.lineList[j].pointList) {
          //  tempList.push(p);
          //}
          holeList.push(aBorder.lineList[j].pointList)
        }

        if (holeList.length > 0) {
          uti.addHoles_Ring(aPolygonList, holeList)
        }
        aPolygonList = uti.addPolygonHoles_Ring(aPolygonList)
      }
      newPolygonList.push(...aPolygonList)
    }

    //newPolygonList = AddPolygonHoles(newPolygonList);
    for (let nPolygon of newPolygonList) {
      if (!uti.isClockwise(nPolygon.outLine.pointList)) {
        nPolygon.outLine.pointList.reverse()
      }
    }

    return newPolygonList
  }

  private static isoline_UndefData(
    S0: number[][],
    X: number[],
    Y: number[],
    W: number,
    S: number[][],
    H: number[][],
    SB: number[][][],
    HB: number[][][],
    lineNum: number
  ): PolyLine[] {
    let cLineList: PolyLine[] = []
    let m: number, n: number, i: number, j: number
    m = S0.length
    n = S0[0].length

    let i1: number,
      i2: number,
      j1: number,
      j2: number,
      i3 = 0,
      j3 = 0
    let a2x: number,
      a2y: number,
      a3x = 0,
      a3y = 0,
      sx: number,
      sy: number
    let aPoint: PointD
    let aLine: PolyLine
    let pList: PointD[]
    let isS = true
    let aEndPoint = new EndPoint()
    //---- Tracing from border
    for (i = 0; i < m; i++) {
      for (j = 0; j < n; j++) {
        if (j < n - 1) {
          if (SB[0][i][j] > -1) {
            //---- Border
            if (S[i][j] !== -2) {
              pList = []
              i2 = i
              j2 = j
              a2x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2]) //---- x of first point
              a2y = Y[i2] //---- y of first point
              if (SB[1][i][j] === 0) {
                //---- Bottom border
                i1 = -1
                aEndPoint.sPoint.x = X[j + 1]
                aEndPoint.sPoint.y = Y[i]
              } else {
                i1 = i2
                aEndPoint.sPoint.x = X[j]
                aEndPoint.sPoint.y = Y[i]
              }
              j1 = j2
              aPoint = new PointD()
              aPoint.x = a2x
              aPoint.y = a2y
              pList.push(aPoint)

              aEndPoint.index = lineNum + cLineList.length
              aEndPoint.point = aPoint
              aEndPoint.borderIdx = SB[0][i][j]
              Contour._endPointList.push(aEndPoint)

              aLine = new PolyLine()
              aLine.type = 'Border'
              aLine.borderIdx = SB[0][i][j]
              while (true) {
                let ij3 = [i3, j3]
                let a3xy = [a3x, a3y]
                let IsS = [isS]
                if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
                  i3 = ij3[0]
                  j3 = ij3[1]
                  a3x = a3xy[0]
                  a3y = a3xy[1]
                  isS = IsS[0]
                  aPoint = new PointD()
                  aPoint.x = a3x
                  aPoint.y = a3y
                  pList.push(aPoint)
                  if (isS) {
                    if (SB[0][i3][j3] > -1) {
                      if (SB[1][i3][j3] === 0) {
                        aEndPoint.sPoint.x = X[j3 + 1]
                        aEndPoint.sPoint.y = Y[i3]
                      } else {
                        aEndPoint.sPoint.x = X[j3]
                        aEndPoint.sPoint.y = Y[i3]
                      }
                      break
                    }
                  } else if (HB[0][i3][j3] > -1) {
                    if (HB[1][i3][j3] === 0) {
                      aEndPoint.sPoint.x = X[j3]
                      aEndPoint.sPoint.y = Y[i3]
                    } else {
                      aEndPoint.sPoint.x = X[j3]
                      aEndPoint.sPoint.y = Y[i3 + 1]
                    }
                    break
                  }
                  a2x = a3x
                  //a2y = a3y;
                  i1 = i2
                  j1 = j2
                  i2 = i3
                  j2 = j3
                } else {
                  aLine.type = 'Error'
                  break
                }
              }
              S[i][j] = -2
              if (pList.length > 1 && !(aLine.type === 'Error')) {
                aEndPoint.point = aPoint
                Contour._endPointList.push(aEndPoint)

                aLine.value = W
                aLine.pointList = pList
                cLineList.push(aLine)
              } else {
                Contour._endPointList.pop()
              }
            }
          }
        }
        if (i < m - 1) {
          if (HB[0][i][j] > -1) {
            //---- Border
            if (H[i][j] !== -2) {
              pList = []
              i2 = i
              j2 = j
              a2x = X[j2]
              a2y = Y[i2] + H[i2][j2] * (Y[i2 + 1] - Y[i2])
              i1 = i2
              if (HB[1][i][j] === 0) {
                j1 = -1
                aEndPoint.sPoint.x = X[j]
                aEndPoint.sPoint.y = Y[i]
              } else {
                j1 = j2
                aEndPoint.sPoint.x = X[j]
                aEndPoint.sPoint.y = Y[i + 1]
              }
              aPoint = new PointD()
              aPoint.x = a2x
              aPoint.y = a2y
              pList.push(aPoint)

              aEndPoint.index = lineNum + cLineList.length
              aEndPoint.point = aPoint
              aEndPoint.borderIdx = HB[0][i][j]
              Contour._endPointList.push(aEndPoint)

              aLine = new PolyLine()
              aLine.type = 'Border'
              aLine.borderIdx = HB[0][i][j]
              while (true) {
                let ij3 = [i3, j3]
                let a3xy = [a3x, a3y]
                let IsS = [isS]
                if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
                  i3 = ij3[0]
                  j3 = ij3[1]
                  a3x = a3xy[0]
                  a3y = a3xy[1]
                  isS = IsS[0]
                  aPoint = new PointD()
                  aPoint.x = a3x
                  aPoint.y = a3y
                  pList.push(aPoint)
                  if (isS) {
                    if (SB[0][i3][j3] > -1) {
                      if (SB[1][i3][j3] === 0) {
                        aEndPoint.sPoint.x = X[j3 + 1]
                        aEndPoint.sPoint.y = Y[i3]
                      } else {
                        aEndPoint.sPoint.x = X[j3]
                        aEndPoint.sPoint.y = Y[i3]
                      }
                      break
                    }
                  } else if (HB[0][i3][j3] > -1) {
                    if (HB[1][i3][j3] === 0) {
                      aEndPoint.sPoint.x = X[j3]
                      aEndPoint.sPoint.y = Y[i3]
                    } else {
                      aEndPoint.sPoint.x = X[j3]
                      aEndPoint.sPoint.y = Y[i3 + 1]
                    }
                    break
                  }
                  a2x = a3x
                  //a2y = a3y;
                  i1 = i2
                  j1 = j2
                  i2 = i3
                  j2 = j3
                } else {
                  aLine.type = 'Error'
                  break
                }
              }
              H[i][j] = -2
              if (pList.length > 1 && !(aLine.type === 'Error')) {
                aEndPoint.point = aPoint
                Contour._endPointList.push(aEndPoint)

                aLine.value = W
                aLine.pointList = pList
                cLineList.push(aLine)
              } else {
                Contour._endPointList.pop()
              }
            }
          }
        }
      }
    }

    //---- Clear border points
    for (j = 0; j < n - 1; j++) {
      if (S[0][j] !== -2) {
        S[0][j] = -2
      }
      if (S[m - 1][j] !== -2) {
        S[m - 1][j] = -2
      }
    }

    for (i = 0; i < m - 1; i++) {
      if (H[i][0] !== -2) {
        H[i][0] = -2
      }
      if (H[i][n - 1] !== -2) {
        H[i][n - 1] = -2
      }
    }

    //---- Tracing close lines
    for (i = 1; i < m - 2; i++) {
      for (j = 1; j < n - 1; j++) {
        if (H[i][j] !== -2) {
          let pointList: PointD[] = []
          i2 = i
          j2 = j
          a2x = X[j2]
          a2y = Y[i] + H[i][j2] * (Y[i + 1] - Y[i])
          j1 = -1
          i1 = i2
          sx = a2x
          sy = a2y
          aPoint = new PointD()
          aPoint.x = a2x
          aPoint.y = a2y
          pointList.push(aPoint)
          aLine = new PolyLine()
          aLine.type = 'Close'

          while (true) {
            let ij3: number[] = []
            let a3xy: number[] = []
            let IsS: boolean[] = []
            if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
              i3 = ij3[0]
              j3 = ij3[1]
              a3x = a3xy[0]
              a3y = a3xy[1]
              //isS = IsS[0];
              aPoint = new PointD()
              aPoint.x = a3x
              aPoint.y = a3y
              pointList.push(aPoint)
              if (Math.abs(a3y - sy) < 0.000001 && Math.abs(a3x - sx) < 0.000001) {
                break
              }

              a2x = a3x
              //a2y = a3y;
              i1 = i2
              j1 = j2
              i2 = i3
              j2 = j3
              //If X[j2] < a2x && i2 = 0 )
              //    aLine.type = "Error"
              //    Exit Do
              //End If
            } else {
              aLine.type = 'Error'
              break
            }
          }
          H[i][j] = -2
          if (pointList.length > 1 && !(aLine.type === 'Error')) {
            aLine.value = W
            aLine.pointList = pointList
            cLineList.push(aLine)
          }
        }
      }
    }

    for (i = 1; i < m - 1; i++) {
      for (j = 1; j < n - 2; j++) {
        if (S[i][j] !== -2) {
          let pointList: PointD[] = []
          i2 = i
          j2 = j
          a2x = X[j2] + S[i][j] * (X[j2 + 1] - X[j2])
          a2y = Y[i]
          j1 = j2
          i1 = -1
          sx = a2x
          sy = a2y
          aPoint = new PointD()
          aPoint.x = a2x
          aPoint.y = a2y
          pointList.push(aPoint)
          aLine = new PolyLine()
          aLine.type = 'Close'

          while (true) {
            let ij3: number[] = []
            let a3xy: number[] = []
            let IsS: boolean[] = []
            if (canTraceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
              i3 = ij3[0]
              j3 = ij3[1]
              a3x = a3xy[0]
              a3y = a3xy[1]
              //isS = IsS[0];
              aPoint = new PointD()
              aPoint.x = a3x
              aPoint.y = a3y
              pointList.push(aPoint)
              if (Math.abs(a3y - sy) < 0.000001 && Math.abs(a3x - sx) < 0.000001) {
                break
              }

              a2x = a3x
              //a2y = a3y;
              i1 = i2
              j1 = j2
              i2 = i3
              j2 = j3
            } else {
              aLine.type = 'Error'
              break
            }
          }
          S[i][j] = -2
          if (pointList.length > 1 && !(aLine.type === 'Error')) {
            aLine.value = W
            aLine.pointList = pointList
            cLineList.push(aLine)
          }
        }
      }
    }

    return cLineList
  }

  private static tracingPolygons_Line_Border(
    LineList: PolyLine[],
    borderList: BorderPoint[]
  ): Polygon[] {
    if (LineList.length === 0) {
      return []
    }

    let aPolygonList: Polygon[] = []
    let aLineList: PolyLine[] = []
    let aLine: PolyLine
    let aPoint: PointD
    let aPolygon: Polygon
    let aBound: Extent
    let i: number, j: number
    aLineList.push(...LineList)
    //---- Tracing border polygon
    let aPList: PointD[]
    let newPList: PointD[]
    let bP: BorderPoint
    let timesArray: number[] = []
    timesArray.length = borderList.length - 1
    for (i = 0; i < timesArray.length; i++) {
      timesArray[i] = 0
    }

    let pIdx: number, pNum: number, vNum: number, vvNum: number
    let aValue = 0,
      bValue = 0,
      cValue = 0
    let lineBorderList: BorderPoint[] = []

    pNum = borderList.length - 1
    for (i = 0; i < pNum; i++) {
      if (borderList[i].id === -1) {
        continue
      }

      pIdx = i
      aPList = []
      lineBorderList.push(borderList[i])

      //---- Clockwise traceing
      if (timesArray[pIdx] < 2) {
        aPList.push(borderList[pIdx].point)
        pIdx += 1
        if (pIdx === pNum) {
          pIdx = 0
        }

        vNum = 0
        vvNum = 0
        while (true) {
          bP = borderList[pIdx]
          if (bP.id === -1) {
            //---- Not endpoint of contour
            if (timesArray[pIdx] === 1) {
              break
            }

            cValue = bP.value
            vvNum += 1
            aPList.push(bP.point)
            timesArray[pIdx] += +1
          } //---- endpoint of contour
          else {
            if (timesArray[pIdx] === 2) {
              break
            }

            timesArray[pIdx] += +1
            aLine = aLineList[bP.id]
            if (vNum === 0) {
              aValue = aLine.value
              bValue = aLine.value
              vNum += 1
            } else {
              if (aLine.value > aValue) {
                bValue = aLine.value
              } else if (aLine.value < aValue) {
                aValue = aLine.value
              }

              vNum += 1
            }
            newPList = []
            newPList.push(...aLine.pointList)
            aPoint = newPList[0]
            //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
            //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              //---- Start point
              newPList.reverse()
            }
            aPList.push(...newPList)
            for (j = 0; j < borderList.length - 1; j++) {
              if (j !== pIdx) {
                if (borderList[j].id === bP.id) {
                  pIdx = j
                  timesArray[pIdx] += +1
                  break
                }
              }
            }
          }

          if (pIdx === i) {
            if (aPList.length > 0) {
              aPolygon = new Polygon()
              aPolygon.isBorder = true
              aPolygon.lowValue = aValue
              aPolygon.highValue = bValue
              aBound = new Extent()
              aPolygon.area = uti.getExtentAndArea(aPList, aBound)
              aPolygon.isClockWise = true
              aPolygon.startPointIdx = lineBorderList.length - 1
              aPolygon.extent = aBound
              aPolygon.outLine.pointList = aPList
              aPolygon.outLine.value = aValue
              aPolygon.isHighCenter = true
              aPolygon.holeLines = []
              if (vvNum > 0) {
                if (cValue < aValue) {
                  aPolygon.isHighCenter = false
                  aPolygon.highValue = aValue
                }
              }
              aPolygon.outLine.type = 'Border'
              aPolygonList.push(aPolygon)
            }
            break
          }
          pIdx += 1
          if (pIdx === pNum) {
            pIdx = 0
          }
        }
      }

      //---- Anticlockwise traceing
      pIdx = i
      if (timesArray[pIdx] < 2) {
        aPList = []
        aPList.push(borderList[pIdx].point)
        pIdx += -1
        if (pIdx === -1) {
          pIdx = pNum - 1
        }

        vNum = 0
        vvNum = 0
        while (true) {
          bP = borderList[pIdx]
          if (bP.id === -1) {
            //---- Not endpoint of contour
            if (timesArray[pIdx] === 1) {
              break
            }

            cValue = bP.value
            vvNum += 1
            aPList.push(bP.point)
            timesArray[pIdx] += +1
          } //---- endpoint of contour
          else {
            if (timesArray[pIdx] === 2) {
              break
            }

            timesArray[pIdx] += +1
            aLine = aLineList[bP.id]
            if (vNum === 0) {
              aValue = aLine.value
              bValue = aLine.value
              vNum += 1
            } else {
              if (aLine.value > aValue) {
                bValue = aLine.value
              } else if (aLine.value < aValue) {
                aValue = aLine.value
              }

              vNum += 1
            }
            newPList = []
            newPList.push(...aLine.pointList)
            aPoint = newPList[0]
            //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
            //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              //---- Start point
              newPList.reverse()
            }
            aPList.push(...newPList)
            for (j = 0; j < borderList.length - 1; j++) {
              if (j !== pIdx) {
                if (borderList[j].id === bP.id) {
                  pIdx = j
                  timesArray[pIdx] += +1
                  break
                }
              }
            }
          }

          if (pIdx === i) {
            if (aPList.length > 0) {
              aPolygon = new Polygon()
              aPolygon.isBorder = true
              aPolygon.lowValue = aValue
              aPolygon.highValue = bValue
              aBound = new Extent()
              aPolygon.area = uti.getExtentAndArea(aPList, aBound)
              aPolygon.isClockWise = false
              aPolygon.startPointIdx = lineBorderList.length - 1
              aPolygon.extent = aBound
              aPolygon.outLine.pointList = aPList
              aPolygon.outLine.value = aValue
              aPolygon.isHighCenter = true
              aPolygon.holeLines = []
              if (vvNum > 0) {
                if (cValue < aValue) {
                  aPolygon.isHighCenter = false
                  aPolygon.highValue = aValue
                }
              }
              aPolygon.outLine.type = 'Border'
              aPolygonList.push(aPolygon)
            }
            break
          }
          pIdx += -1
          if (pIdx === -1) {
            pIdx = pNum - 1
          }
        }
      }
    }

    //---- tracing close polygons
    let cPolygonlist: Polygon[] = []
    let isInserted: boolean
    for (i = 0; i < aLineList.length; i++) {
      aLine = aLineList[i]
      if (aLine.type === 'Close' && aLine.pointList.length > 0) {
        aPolygon = new Polygon()
        aPolygon.isBorder = false
        aPolygon.lowValue = aLine.value
        aPolygon.highValue = aLine.value
        aBound = new Extent()
        aPolygon.area = uti.getExtentAndArea(aLine.pointList, aBound)
        aPolygon.isClockWise = uti.isClockwise(aLine.pointList)
        aPolygon.extent = aBound
        aPolygon.outLine = aLine
        aPolygon.isHighCenter = true
        aPolygon.holeLines = []

        //---- Sort from big to small
        isInserted = false
        for (j = 0; j < cPolygonlist.length; j++) {
          if (aPolygon.area > cPolygonlist[j].area) {
            cPolygonlist.splice(j, 0, aPolygon)
            isInserted = true
            break
          }
        }
        if (!isInserted) {
          cPolygonlist.push(aPolygon)
        }
      }
    }

    //---- Juge isHighCenter for border polygons
    aPolygonList = uti.judgePolygonHighCenter(aPolygonList, cPolygonlist, aLineList, borderList)

    return aPolygonList
  }

  private static addPolygonHoles(polygonList: Polygon[]): Polygon[] {
    let holePolygons: Polygon[] = []
    let i: number, j: number
    for (i = 0; i < polygonList.length; i++) {
      let aPolygon = polygonList[i]
      if (!aPolygon.isBorder) {
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
            if (
              uti.pointInPolygonByPList(bPolygon.outLine.pointList, aPolygon.outLine.pointList[0])
            ) {
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
        if (aPolygon.isBorder === true) {
          for (j = 0; j < hole1Polygons.length; j++) {
            let bPolygon = hole1Polygons[j]
            if (aPolygon.extent.include(bPolygon.extent)) {
              if (
                uti.pointInPolygonByPList(aPolygon.outLine.pointList, bPolygon.outLine.pointList[0])
              ) {
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
  public tracingStreamline(
    U: number[][],
    V: number[][],
    X: number[],
    Y: number[],
    UNDEF: number,
    density: number
  ): PolyLine[] {
    let streamLines: PolyLine[] = []
    let xNum = U[1].length
    let yNum = U.length
    let Dx: number[][] = []
    let Dy: number[][] = []
    let deltX = X[1] - X[0]
    let deltY = Y[1] - Y[0]
    if (density === 0) {
      density = 1
    }
    let radius = deltX / Math.pow(density, 2)
    //double smallRadius = deltX / (Math.pow(density, 10));
    let smallRadius = radius * 1.5
    let i: number, j: number

    //Normalize wind components
    for (i = 0; i < yNum; i++) {
      Dx[i] = []
      Dy[i] = []
      for (j = 0; j < xNum; j++) {
        if (Math.abs(U[i][j] / UNDEF - 1) < 0.01) {
          Dx[i][j] = 0.1
          Dy[i][j] = 0.1
        } else {
          let WS = Math.sqrt(U[i][j] * U[i][j] + V[i][j] * V[i][j])
          if (WS === 0) {
            WS = 1
          }
          Dx[i][j] = ((U[i][j] / WS) * deltX) / density
          Dy[i][j] = ((V[i][j] / WS) * deltY) / density
        }
      }
    }

    //Flag the grid boxes
    let SPoints: BorderPoint[][][] = []
    let flags: number[][] = []
    for (i = 0; i < yNum - 1; i++) {
      SPoints[i] = []
      flags[i] = []
      for (j = 0; j < xNum - 1; j++) {
        if (i % 2 === 0 && j % 2 === 0) {
          flags[i][j] = 0
        } else {
          flags[i][j] = 1
        }

        SPoints[i][j] = []
      }
    }

    //Tracing streamline
    let dis: number
    let borderP: BorderPoint
    let lineN = 0
    for (i = 0; i < yNum - 1; i++) {
      for (j = 0; j < xNum - 1; j++) {
        if (flags[i][j] === 0) {
          //No streamline started form this grid box, a new streamline started
          let pList: PointD[] = []
          let aPoint: PointD = new PointD()
          let ii: number, jj: number
          let loopN: number
          let aPL = new PolyLine()

          //Start point - the center of the grid box
          aPoint.x = X[j] + deltX / 2
          aPoint.y = Y[i] + deltY / 2
          pList.push(aPoint.clone())
          borderP = new BorderPoint()
          borderP.point = aPoint.clone()
          borderP.id = lineN
          SPoints[i][j].push(borderP)
          flags[i][j] = 1 //Flag the grid box and no streamline will start from this box again
          ii = i
          jj = j
          let loopLimit = 500

          //Tracing forward
          loopN = 0
          while (loopN < loopLimit) {
            //Trace next streamline point
            let iijj: number[] = []
            iijj[0] = ii
            iijj[1] = jj
            let isInDomain = tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, true)
            ii = iijj[0]
            jj = iijj[1]

            //Terminating the streamline
            if (isInDomain) {
              if (
                Math.abs(U[ii][jj] / UNDEF - 1) < 0.01 ||
                Math.abs(U[ii][jj + 1] / UNDEF - 1) < 0.01 ||
                Math.abs(U[ii + 1][jj] / UNDEF - 1) < 0.01 ||
                Math.abs(U[ii + 1][jj + 1] / UNDEF - 1) < 0.01
              ) {
                break
              } else {
                let isTerminating = false
                for (let sPoint of SPoints[ii][jj]) {
                  if (
                    Math.sqrt(
                      (aPoint.x - sPoint.point.x) * (aPoint.x - sPoint.point.x) +
                        (aPoint.y - sPoint.point.y) * (aPoint.y - sPoint.point.y)
                    ) < radius
                  ) {
                    isTerminating = true
                    break
                  }
                }
                if (!isTerminating) {
                  if (SPoints[ii][jj].length > 1) {
                    let pointStart = SPoints[ii][jj][0]
                    let pointEnd = SPoints[ii][jj][1]
                    if (!(lineN === pointStart.id && lineN === pointEnd.id)) {
                      dis = uti.distance_point2line(pointStart.point, pointEnd.point, aPoint)
                      if (dis < smallRadius) {
                        isTerminating = true
                      }
                    }
                  }
                }
                if (!isTerminating) {
                  pList.push(aPoint.clone())
                  borderP = new BorderPoint()
                  borderP.point = aPoint.clone()
                  borderP.id = lineN
                  SPoints[ii][jj].push(borderP)
                  flags[ii][jj] = 1
                } else {
                  break
                }
              }
            } else {
              break
            }

            loopN += 1
          }

          //Tracing backword
          aPoint.x = X[j] + deltX / 2
          aPoint.y = Y[i] + deltY / 2
          ii = i
          jj = j
          loopN = 0
          while (loopN < loopLimit) {
            //Trace next streamline point
            let iijj: number[] = []
            iijj[0] = ii
            iijj[1] = jj
            let isInDomain = tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, false)
            ii = iijj[0]
            jj = iijj[1]

            //Terminating the streamline
            if (isInDomain) {
              if (
                Math.abs(U[ii][jj] / UNDEF - 1) < 0.01 ||
                Math.abs(U[ii][jj + 1] / UNDEF - 1) < 0.01 ||
                Math.abs(U[ii + 1][jj] / UNDEF - 1) < 0.01 ||
                Math.abs(U[ii + 1][jj + 1] / UNDEF - 1) < 0.01
              ) {
                break
              } else {
                let isTerminating = false
                for (let sPoint of SPoints[ii][jj]) {
                  if (
                    Math.sqrt(
                      (aPoint.x - sPoint.point.x) * (aPoint.x - sPoint.point.x) +
                        (aPoint.y - sPoint.point.y) * (aPoint.y - sPoint.point.y)
                    ) < radius
                  ) {
                    isTerminating = true
                    break
                  }
                }
                if (!isTerminating) {
                  if (SPoints[ii][jj].length > 1) {
                    let pointStart = SPoints[ii][jj][0]
                    let pointEnd = SPoints[ii][jj][1]
                    if (!(lineN === pointStart.id && lineN === pointEnd.id)) {
                      dis = uti.distance_point2line(pointStart.point, pointEnd.point, aPoint)
                      if (dis < smallRadius) {
                        isTerminating = true
                      }
                    }
                  }
                }
                if (!isTerminating) {
                  pList.splice(0, 0, aPoint.clone())
                  borderP = new BorderPoint()
                  borderP.point = aPoint.clone()
                  borderP.id = lineN
                  SPoints[ii][jj].push(borderP)
                  flags[ii][jj] = 1
                } else {
                  break
                }
              }
            } else {
              break
            }

            loopN += 1
          }
          if (pList.length > 1) {
            aPL.pointList = pList
            streamLines.push(aPL)
            lineN += 1
          }
        }
      }
    }

    //Return
    return streamLines
  }

  private static insertPoint2Border(
    bPList: BorderPoint[],
    aBorderList: BorderPoint[]
  ): BorderPoint[] {
    let aBPoint: BorderPoint, bP: BorderPoint
    let i: number, j: number
    let p1: PointD, p2: PointD, p3: PointD
    let BorderList: BorderPoint[] = []
    BorderList.push(...aBorderList)

    for (i = 0; i < bPList.length; i++) {
      bP = bPList[i]
      p3 = bP.point
      aBPoint = BorderList[0]
      p1 = aBPoint.point
      for (j = 1; j < BorderList.length; j++) {
        aBPoint = BorderList[j]
        p2 = aBPoint.point
        if ((p3.x - p1.x) * (p3.x - p2.x) <= 0) {
          if ((p3.y - p1.y) * (p3.y - p2.y) <= 0) {
            if ((p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y) === 0) {
              BorderList.splice(j, 0, bP)
              break
            }
          }
        }
        p1 = p2
      }
    }

    return BorderList
  }

  private static insertPoint2Border_Ring(
    S0: number[][],
    bPList: BorderPoint[],
    aBorder: Border,
    pNums: number[]
  ): BorderPoint[] {
    let aBPoint: BorderPoint, bP: BorderPoint
    let i: number, j: number, k: number
    let p1: PointD, p2: PointD, p3: PointD
    //ArrayList aEPList = new ArrayList(), temEPList = new ArrayList(), dList = new ArrayList();
    let aBLine: BorderLine
    let newBPList: BorderPoint[] = [],
      tempBPList: BorderPoint[] = [],
      tempBPList1: BorderPoint[] = []

    //pNums = new int[aBorder.getLineNum()];
    for (k = 0; k < aBorder.getLineNum(); k++) {
      aBLine = aBorder.lineList[k]
      tempBPList = []
      for (i = 0; i < aBLine.pointList.length; i++) {
        aBPoint = new BorderPoint()
        aBPoint.id = -1
        aBPoint.borderIdx = k
        aBPoint.point = aBLine.pointList[i]
        aBPoint.value = S0[aBLine.ijPointList[i].i][aBLine.ijPointList[i].j]
        tempBPList.push(aBPoint)
      }
      for (i = 0; i < bPList.length; i++) {
        bP = bPList[i].clone()
        bP.borderIdx = k
        p3 = bP.point
        //aBPoint = (BorderPoint)tempBPList[0];
        p1 = tempBPList[0].point.clone()
        for (j = 1; j < tempBPList.length; j++) {
          //aBPoint = (BorderPoint)tempBPList[j];
          p2 = tempBPList[j].point.clone()
          if ((p3.x - p1.x) * (p3.x - p2.x) <= 0) {
            if ((p3.y - p1.y) * (p3.y - p2.y) <= 0) {
              if ((p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y) === 0) {
                tempBPList.splice(j, 0, bP)
                break
              }
            }
          }
          p1 = p2
        }
      }
      tempBPList1 = []
      for (i = 0; i < tempBPList.length; i++) {
        bP = tempBPList[i]
        bP.bInnerIdx = i
        tempBPList1.push(bP)
      }
      pNums[k] = tempBPList1.length
      newBPList.push(...tempBPList1)
    }

    return newBPList
  }
}
