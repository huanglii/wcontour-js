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
import { PolyLineType } from './global/types'
import {
  doubleEquals,
  getExtent,
  getExtentAndArea,
  isClockwise,
  isExtentCross,
  pointInPolygonByPList,
  traceBorder,
} from './util'

export default class Contour {
  private static _endPointList: EndPoint[] = []

  /**
   * tracing data flag array of the grid data.
   * grid data are from left to right and from bottom to top, first dimention is y, second dimention is x
   *
   * @param s0 input grid data
   * @param undefData undefine data
   * @returns data flag array: 0-undefine data; 1-border point; 2-inside point
   */
  public static tracingDataFlag(s0: number[][], undefData: number): number[][] {
    let s1: number[][] = []
    const m = s0.length // y
    const n = s0[0].length // x

    // Generate data flag array
    // 1. 0 with undefine data, 1 with data
    for (let i = 0; i < m; i++) {
      s1[i] = []
      for (let j = 0; j < n; j++) {
        s1[i][j] = doubleEquals(s0[i][j], undefData) ? 0 : 1
      }
    }
    // 2. data flag array: border points are 1, undefine points are 0, inside data points are 2
    for (let i = 1; i < m - 1; i++) {
      for (let j = 1; j < n - 1; j++) {
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
      for (let i = 1; i < m - 1; i++) {
        for (let j = 1; j < n - 1; j++) {
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
    for (let j = 0; j < n; j++) {
      if (s1[0][j] === 1) {
        if (s1[1][j] === 0) {
          // up point is undefine
          s1[0][j] = 0
        } else if (j === 0) {
          if (s1[0][j + 1] === 0) {
            s1[0][j] = 0
          }
        } else if (j === n - 1) {
          if (s1[0][n - 2] === 0) {
            s1[0][j] = 0
          }
        } else if (s1[0][j - 1] === 0 && s1[0][j + 1] === 0) {
          s1[0][j] = 0
        }
      }
      if (s1[m - 1][j] === 1) {
        if (s1[m - 2][j] === 0) {
          // down point is undefine
          s1[m - 1][j] = 0
        } else if (j === 0) {
          if (s1[m - 1][j + 1] === 0) {
            s1[m - 1][j] = 0
          }
        } else if (j === n - 1) {
          if (s1[m - 1][n - 2] === 0) {
            s1[m - 1][j] = 0
          }
        } else if (s1[m - 1][j - 1] === 0 && s1[m - 1][j + 1] === 0) {
          s1[m - 1][j] = 0
        }
      }
    }
    // left and right border points
    for (let i = 0; i < m; i++) {
      if (s1[i][0] === 1) {
        if (s1[i][1] === 0) {
          // right point is undefine
          s1[i][0] = 0
        } else if (i === 0) {
          if (s1[i + 1][0] === 0) {
            s1[i][0] = 0
          }
        } else if (i === m - 1) {
          if (s1[m - 2][0] === 0) {
            s1[i][0] = 0
          }
        } else if (s1[i - 1][0] === 0 && s1[i + 1][0] === 0) {
          s1[i][0] = 0
        }
      }
      if (s1[i][n - 1] === 1) {
        if (s1[i][n - 2] === 0) {
          // left point is undefine
          s1[i][n - 1] = 0
        } else if (i === 0) {
          if (s1[i + 1][n - 1] === 0) {
            s1[i][n - 1] = 0
          }
        } else if (i === m - 1) {
          if (s1[m - 2][n - 1] === 0) {
            s1[i][n - 1] = 0
          }
        } else if (s1[i - 1][n - 1] === 0 && s1[i + 1][n - 1] === 0) {
          s1[i][n - 1] = 0
        }
      }
    }
    return s1
  }

  /**
   * tracing contour borders of the grid data with data flag.
   * @param s0 input grid data
   * @param s1 data flag array
   * @param x x coordinate array
   * @param y y coordinate array
   * @returns borderline list
   */
  public static tracingBorders(s0: number[][], s1: number[][], x: number[], y: number[]): Border[] {
    let borderLines: BorderLine[] = []
    const m = s0.length // y
    const n = s0[0].length // x

    // generate s2 from s1, add border to s2 with undefine data.
    let s2: number[][] = []
    for (let i = 0; i < m + 2; i++) {
      s2[i] = []
      for (let j = 0; j < n + 2; j++) {
        if (i === 0 || i === m + 1) {
          // bottom or top border
          s2[i][j] = 0
        } else if (j === 0 || j === n + 1) {
          // left or right border
          s2[i][j] = 0
        } else {
          s2[i][j] = s1[i - 1][j - 1]
        }
      }
    }

    // using times number of each point during chacing process.
    let uNum: number[][] = []
    for (let i = 0; i < m + 2; i++) {
      uNum[i] = []
      for (let j = 0; j < n + 2; j++) {
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
    for (let i = 1; i < m + 1; i++) {
      for (let j = 1; j < n + 1; j++) {
        if (s2[i][j] === 1) {
          // tracing border from any border point
          let pointList: PointD[] = []
          let ijPList: IJPoint[] = []
          pointList.push(new PointD(x[j - 1], y[i - 1]))
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
            if (traceBorder(s2, i1, i2, j1, j2, ij3)) {
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

            pointList.push(new PointD(x[j3 - 1], y[i3 - 1]))
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
            aBLine.area = getExtentAndArea(pointList, aBLine.extent)
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
      if (!isClockwise(aLine.pointList)) {
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
        if (!isClockwise(aLine.pointList)) {
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
            if (pointInPolygonByPList(aLine.pointList, aPoint)) {
              // bLine is inside of aLine
              bLine.isOutLine = false
              if (isClockwise(bLine.pointList)) {
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
   * @param S0 input grid data
   * @param X X coordinate array
   * @param Y Y coordinate array
   * @param contour contour value array
   * @param nx interval of X coordinate
   * @param ny interval of Y coordinate
   * @param S1 flag array
   * @param undefData undefine data
   * @param borders border line list
   * @return contour line list
   */
  public static tracingContourLines(
    s0: number[][],
    X: number[],
    Y: number[],
    contour: number[],
    S1: number[][],
    borders: Border[],
    undefData: number
  ): PolyLine[] {
    let contourLineList: PolyLine[] = []
    let cLineList: PolyLine[]
    const m = s0.length // y
    const n = s0[0].length // x

    // Add a small value to aviod the contour point as same as data point
    let dShift = contour[0] * 0.00001
    if (dShift === 0) {
      dShift = 0.00001
    }
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (!doubleEquals(s0[i][j], undefData)) {
          // s0[i, j] = s0[i, j] + (contour[1] - contour[0]) * 0.0001;
          s0[i][j] = s0[i][j] + dShift
        }
      }
    }

    //---- Define if H S are border
    let SB: number[][][] = []
    let HB: number[][][] = [] // Which border and trace direction
    SB[0] = []
    SB[1] = []
    HB[0] = []
    HB[1] = []
    for (let i = 0; i < m; i++) {
      SB[0][i] = []
      SB[1][i] = []
      HB[0][i] = []
      HB[1][i] = []
      for (let j = 0; j < n; j++) {
        if (j < n - 1) {
          SB[0][i][j] = -1
          SB[1][i][j] = -1
        }
        if (i < m - 1) {
          HB[0][i][j] = -1
          HB[1][i][j] = -1
        }
      }
    }
    let k: number, si: number, sj: number
    let aijP: IJPoint, bijP: IJPoint
    for (let i = 0; i < borders.length; i++) {
      const aBorder = borders[i]
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
              //---- Trace from top
              SB[1][si][sj] = 1
            } else {
              SB[1][si][sj] = 0 //----- Trace from bottom
            }
          } else {
            sj = aijP.j
            si = Math.min(aijP.i, bijP.i)
            HB[0][si][sj] = i
            if (bijP.i > aijP.i) {
              //---- Trace from left
              HB[1][si][sj] = 0
            } else {
              HB[1][si][sj] = 1 //---- Trace from right
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
      for (let i = 0; i < m; i++) {
        S[i] = []
        H[i] = []
        for (let j = 0; j < n; j++) {
          if (j < n - 1) {
            if (S1[i][j] !== 0 && S1[i][j + 1] !== 0) {
              if ((s0[i][j] - w) * (s0[i][j + 1] - w) < 0) {
                //---- Has tracing value
                S[i][j] = (w - s0[i][j]) / (s0[i][j + 1] - s0[i][j])
              } else {
                S[i][j] = -2
              }
            } else {
              S[i][j] = -2
            }
          }
          if (i < m - 1) {
            if (S1[i][j] !== 0 && S1[i + 1][j] !== 0) {
              if ((s0[i][j] - w) * (s0[i + 1][j] - w) < 0) {
                //---- Has tracing value
                H[i][j] = (w - s0[i][j]) / (s0[i + 1][j] - s0[i][j])
              } else {
                H[i][j] = -2
              }
            } else {
              H[i][j] = -2
            }
          }
        }
      }

      cLineList = Contour.isoline_UndefData(s0, X, Y, w, S, H, SB, HB, contourLineList.length)
      for (let ln of cLineList) {
        contourLineList.push(ln)
      }
    }

    //---- Set border index for close contours
    for (let i = 0; i < borders.length; i++) {
      const aBorder = borders[i]
      const aBLine = aBorder.lineList[0]
      for (let j = 0; j < contourLineList.length; j++) {
        const aLine = contourLineList[j]
        if (aLine.type === 'Close') {
          const aPoint = aLine.pointList[0]
          if (pointInPolygonByPList(aBLine.pointList, aPoint)) {
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
   * Create contour lines
   *
   * @param S0 input grid data array
   * @param X X coordinate array
   * @param Y Y coordinate array
   * @param nc number of contour values
   * @param contour contour value array
   * @param nx Interval of X coordinate
   * @param ny Interval of Y coordinate
   * @return contour lines
   */
  private static createContourLines(
    S0: number[][],
    X: number[],
    Y: number[],
    nc: number,
    contour: number[],
    nx: number,
    ny: number
  ): PolyLine[] {
    let contourLineList: PolyLine[] = [],
      bLineList: PolyLine[],
      lLineList,
      tLineList: PolyLine[],
      rLineList: PolyLine[],
      cLineList: PolyLine[]
    let m: number, n: number, i: number, j: number
    m = S0.length //---- Y
    n = S0[0].length //---- X

    //---- Define horizontal and vertical arrays with the position of the tracing value, -2 means no tracing point.
    let S: number[][] = [],
      H: number[][] = []
    let dShift: number
    dShift = contour[0] * 0.00001
    if (dShift === 0) {
      dShift = 0.00001
    }
    for (i = 0; i < m; i++) {
      for (j = 0; j < n; j++) {
        S0[i][j] = S0[i][j] + dShift
      }
    }

    let w: number //---- Tracing value
    let c: number
    for (c = 0; c < nc; c++) {
      w = contour[c]
      for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
          if (j < n - 1) {
            if ((S0[i][j] - w) * (S0[i][j + 1] - w) < 0) {
              //---- Has tracing value
              S[i][j] = (w - S0[i][j]) / (S0[i][j + 1] - S0[i][j])
            } else {
              S[i][j] = -2
            }
          }
          if (i < m - 1) {
            if ((S0[i][j] - w) * (S0[i + 1][j] - w) < 0) {
              //---- Has tracing value
              H[i][j] = (w - S0[i][j]) / (S0[i + 1][j] - S0[i][j])
            } else {
              H[i][j] = -2
            }
          }
        }
      }

      bLineList = Contour.isoline_Bottom(S0, X, Y, w, nx, ny, S, H)
      lLineList = Contour.isoline_Left(S0, X, Y, w, nx, ny, S, H)
      tLineList = Contour.isoline_Top(S0, X, Y, w, nx, ny, S, H)
      rLineList = Contour.isoline_Right(S0, X, Y, w, nx, ny, S, H)
      cLineList = Contour.isoline_Close(S0, X, Y, w, nx, ny, S, H)
      Contour.addAll(bLineList, contourLineList)
      Contour.addAll(lLineList, contourLineList)
      Contour.addAll(tLineList, contourLineList)
      Contour.addAll(rLineList, contourLineList)
      Contour.addAll(cLineList, contourLineList)
    }

    return contourLineList
  }

  private static addAll(source, dest) {
    if (!dest) {
      console.log('������������֮ǰ��Ҫ�ȳ�ʼ��Ŀ�����飡')
    }
    for (let s of source) {
      dest.push(s)
    }
  }

  /**
   * Cut contour lines with a polygon. Return the polylines inside of the
   * polygon
   *
   * @param alinelist polyline list
   * @param polyList border points of the cut polygon
   * @return Inside Polylines after cut
   */
  private static cutContourWithPolygon(alinelist: PolyLine[], polyList: PointD[]): PolyLine[] {
    let newLineList: PolyLine[] = []
    let i: number, j: number, k: number
    let aLine: PolyLine,
      bLine: PolyLine = new PolyLine()
    let aPList: PointD[]
    let aValue: number
    let aType: PolyLineType
    let ifInPolygon: boolean
    let q1: PointD, q2: PointD, p1: PointD, p2: PointD, IPoint: PointD
    let lineA: Line, lineB: Line
    let aEndPoint: EndPoint = new EndPoint()

    Contour._endPointList = []
    if (!isClockwise(polyList)) {
      //---- Make cut polygon clockwise
      polyList.reverse()
    }

    for (i = 0; i < alinelist.length; i++) {
      aLine = alinelist[i]
      aValue = aLine.value
      aType = aLine.type
      aPList = []
      Contour.addAll(aLine.pointList, aPList)
      ifInPolygon = false
      let newPlist: PointD[] = []
      //---- For "Close" type contour,the start point must be outside of the cut polygon.
      if (aType === 'Close' && pointInPolygonByPList(polyList, aPList[0])) {
        let isAllIn: boolean = true
        let notInIdx: number = 0
        for (j = 0; j < aPList.length; j++) {
          if (!pointInPolygonByPList(polyList, aPList[j])) {
            notInIdx = j
            isAllIn = false
            break
          }
        }
        if (!isAllIn) {
          let bPList: PointD[] = []
          for (j = notInIdx; j < aPList.length; j++) {
            bPList.push(aPList[0])
          }

          for (j = 1; j < notInIdx; j++) {
            bPList.push(aPList[0])
          }

          bPList.push(bPList[0])
          aPList = bPList
        }
      }
      p1 = new PointD()
      for (j = 0; j < aPList.length; j++) {
        p2 = aPList[j]
        if (pointInPolygonByPList(polyList, p2)) {
          if (!ifInPolygon && j > 0) {
            lineA = new Line()
            lineA.P1 = p1
            lineA.P2 = p2
            q1 = polyList[polyList.length - 1]
            IPoint = new PointD()
            for (k = 0; k < polyList.length; k++) {
              q2 = polyList[k]
              lineB = new Line()
              lineB.P1 = q1
              lineB.P2 = q2
              if (Contour.isLineSegmentCross(lineA, lineB)) {
                IPoint = Contour.getCrossPointD(lineA, lineB)
                aEndPoint.sPoint = q1
                aEndPoint.point = IPoint
                aEndPoint.index = newLineList.length
                Contour._endPointList.push(aEndPoint) //---- Generate _endPointList for border insert
                break
              }
              q1 = q2
            }
            newPlist.push(IPoint)
            aType = 'Border'
          }
          newPlist.push(aPList[j])
          ifInPolygon = true
        } else if (ifInPolygon) {
          lineA = new Line()
          lineA.P1 = p1
          lineA.P2 = p2
          q1 = polyList[polyList.length - 1]
          IPoint = new PointD()
          for (k = 0; k < polyList.length; k++) {
            q2 = polyList[k]
            lineB = new Line()
            lineB.P1 = q1
            lineB.P2 = q2
            if (Contour.isLineSegmentCross(lineA, lineB)) {
              IPoint = Contour.getCrossPointD(lineA, lineB)
              aEndPoint.sPoint = q1
              aEndPoint.point = IPoint
              aEndPoint.index = newLineList.length
              Contour._endPointList.push(aEndPoint)
              break
            }
            q1 = q2
          }
          newPlist.push(IPoint)

          bLine.value = aValue
          bLine.type = aType
          bLine.pointList = newPlist
          newLineList.push(bLine)
          ifInPolygon = false
          newPlist = []
          aType = 'Border'
        }
        p1 = p2
      }
      if (ifInPolygon && newPlist.length > 1) {
        bLine.value = aValue
        bLine.type = aType
        bLine.pointList = newPlist
        newLineList.push(bLine)
      }
    }

    return newLineList
  }

  /**
   * Cut contour lines with a polygon. Return the polylines inside of the
   * polygon
   *
   * @param alinelist polyline list
   * @param aBorder border for clipping
   * @return inside plylines after clipping
   */
  private static cutContourLines(alinelist: PolyLine[], aBorder: Border): PolyLine[] {
    let pointList: PointD[] = aBorder.lineList[0].pointList
    let newLineList: PolyLine[] = []
    let i: number, j: number, k: number
    let aLine: PolyLine, bLine: PolyLine
    let aPList: PointD[]
    let aValue: number
    let aType: PolyLineType
    let ifInPolygon: boolean
    let q1: PointD, q2: PointD, p1: PointD, p2: PointD, IPoint: PointD
    let lineA: Line, lineB: Line
    let aEndPoint: EndPoint = new EndPoint()

    Contour._endPointList = []
    if (!isClockwise(pointList)) {
      //---- Make cut polygon clockwise
      pointList.reverse()
    }

    for (i = 0; i < alinelist.length; i++) {
      aLine = alinelist[i]
      aValue = aLine.value
      aType = aLine.type
      aPList = []
      Contour.addAll(aLine.pointList, aPList)
      ifInPolygon = false
      let newPlist: PointD[] = []
      //---- For "Close" type contour,the start point must be outside of the cut polygon.
      if (aType === 'Close' && pointInPolygonByPList(pointList, aPList[0])) {
        let isAllIn: boolean = true
        let notInIdx: number = 0
        for (j = 0; j < aPList.length; j++) {
          if (!pointInPolygonByPList(pointList, aPList[j])) {
            notInIdx = j
            isAllIn = false
            break
          }
        }
        if (!isAllIn) {
          let bPList: PointD[] = []
          for (j = notInIdx; j < aPList.length; j++) {
            bPList.push(aPList[j])
          }

          for (j = 1; j < notInIdx; j++) {
            bPList.push(aPList[j])
          }

          bPList.push(bPList[0])
          aPList = bPList
        }
      }

      p1 = new PointD()
      for (j = 0; j < aPList.length; j++) {
        p2 = aPList[j]
        if (pointInPolygonByPList(pointList, p2)) {
          if (!ifInPolygon && j > 0) {
            lineA = new Line()
            lineA.P1 = p1
            lineA.P2 = p2
            q1 = pointList[pointList.length - 1]
            IPoint = new PointD()
            for (k = 0; k < pointList.length; k++) {
              q2 = pointList[k]
              lineB = new Line()
              lineB.P1 = q1
              lineB.P2 = q2
              if (Contour.isLineSegmentCross(lineA, lineB)) {
                IPoint = Contour.getCrossPointD(lineA, lineB)
                aEndPoint.sPoint = q1
                aEndPoint.point = IPoint
                aEndPoint.index = newLineList.length
                Contour._endPointList.push(aEndPoint) //---- Generate _endPointList for border insert
                break
              }
              q1 = q2
            }
            newPlist.push(IPoint)
            aType = 'Border'
          }
          newPlist.push(aPList[j])
          ifInPolygon = true
        } else if (ifInPolygon) {
          lineA = new Line()
          lineA.P1 = p1
          lineA.P2 = p2
          q1 = pointList[pointList.length - 1]
          IPoint = new PointD()
          for (k = 0; k < pointList.length; k++) {
            q2 = pointList[k]
            lineB = new Line()
            lineB.P1 = q1
            lineB.P2 = q2
            if (Contour.isLineSegmentCross(lineA, lineB)) {
              IPoint = Contour.getCrossPointD(lineA, lineB)
              aEndPoint.sPoint = q1
              aEndPoint.point = IPoint
              aEndPoint.index = newLineList.length
              Contour._endPointList.push(aEndPoint)
              break
            }
            q1 = q2
          }
          newPlist.push(IPoint)

          bLine = new PolyLine()
          bLine.value = aValue
          bLine.type = aType
          bLine.pointList = newPlist
          newLineList.push(bLine)
          ifInPolygon = false
          newPlist = []
          aType = 'Border'
        }
        p1 = p2
      }
      if (ifInPolygon && newPlist.length > 1) {
        bLine = new PolyLine()
        bLine.value = aValue
        bLine.type = aType
        bLine.pointList = newPlist
        newLineList.push(bLine)
      }
    }

    return newLineList
  }

  /**
   * Smooth polylines
   *
   * @param aLineList polyline list
   * @return polyline list after smoothing
   */
  public static smoothLines(aLineList: PolyLine[]): PolyLine[] {
    let newLineList: PolyLine[] = []
    let i: number
    let aline: PolyLine
    let newPList: PointD[]
    //double aValue;
    //String aType;

    for (i = 0; i < aLineList.length; i++) {
      aline = aLineList[i]
      //aValue = aline.Value;
      //aType = aline.Type;
      newPList = []
      Contour.addAll(aline.pointList, newPList)
      if (newPList.length <= 1) {
        continue
      }

      if (newPList.length === 2) {
        let bP: PointD = new PointD()
        let aP: PointD = newPList[0]
        let cP: PointD = newPList[1]
        bP.x = (cP.x - aP.x) / 4 + aP.x
        bP.y = (cP.y - aP.y) / 4 + aP.y
        newPList.splice(1, 0, bP)
        bP = new PointD()
        bP.x = ((cP.x - aP.x) / 4) * 3 + aP.x
        bP.y = ((cP.y - aP.y) / 4) * 3 + aP.y
        newPList.splice(2, 0, bP)
      }
      if (newPList.length === 3) {
        let bP: PointD = new PointD()
        let aP: PointD = newPList[0]
        let cP: PointD = newPList[1]
        bP.x = (cP.x - aP.x) / 2 + aP.x
        bP.y = (cP.y - aP.y) / 2 + aP.y
        newPList.splice(1, 0, bP)
      }
      newPList = Contour.BSplineScanning(newPList, newPList.length)
      aline.pointList = newPList
      newLineList.push(aline)
    }

    return newLineList
  }

  /**
   * Smooth points
   *
   * @param pointList point list
   * @return smoothed point list
   */
  public static smoothPoints(pointList: PointD[]): PointD[] {
    return Contour.BSplineScanning(pointList, pointList.length)
  }

  /**
   * Tracing polygons from contour lines and borders
   *
   * @param S0 input grid data
   * @param cLineList contour lines
   * @param borderList borders
   * @param contour contour values
   * @return traced contour polygons
   */
  public static tracingPolygons(
    S0: number[][],
    cLineList: PolyLine[],
    borderList: Border[],
    contour: number[]
  ): Polygon[] {
    let aPolygonList: Polygon[] = [],
      newPolygonList: Polygon[] = []
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
      if (!isClockwise(PList)) {
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
            aPolygon.area = getExtentAndArea(PList, aPolygon.extent)
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
            aPolygon.area = getExtentAndArea(PList, aPolygon.extent)
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

          aPolygonList = Contour.tracingPolygons_Ring(lineList, newBPList, aBorder, contour, pNums)
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
          Contour.addHoles_Ring(aPolygonList, holeList)
        }
        aPolygonList = Contour.addPolygonHoles_Ring(aPolygonList)
      }
      Contour.addAll(aPolygonList, newPolygonList)
    }

    //newPolygonList = AddPolygonHoles(newPolygonList);
    for (let nPolygon of newPolygonList) {
      if (!isClockwise(nPolygon.outLine.pointList)) {
        nPolygon.outLine.pointList.reverse()
      }
    }

    return newPolygonList
  }

  /**
   * Create contour polygons
   *
   * @param LineList contour lines
   * @param aBound grid data extent
   * @param contour contour values
   * @return contour polygons
   */
  private static createContourPolygons(
    LineList: PolyLine[],
    aBound: Extent,
    contour: number[]
  ): Polygon[] {
    let aPolygonList: Polygon[]
    let newBorderList: BorderPoint[]

    //---- Insert points to border list
    newBorderList = Contour.insertPoint2RectangleBorder(LineList, aBound)

    //---- Tracing polygons
    aPolygonList = Contour.tracingPolygons_Extent(LineList, newBorderList, aBound, contour)

    return aPolygonList
  }

  /**
   * Create polygons from cutted contour lines
   *
   * @param LineList polylines
   * @param polyList border point list
   * @param aBound extent
   * @param contour contour values
   * @return contour polygons
   */
  private static createCutContourPolygons(
    LineList: PolyLine[],
    polyList: PointD[],
    aBound: Extent,
    contour: number[]
  ): Polygon[] {
    let aPolygonList: Polygon[]
    let newBorderList: BorderPoint[]
    let borderList: BorderPoint[] = []
    let aPoint: PointD
    let aBPoint: BorderPoint
    let i: number

    //---- Get border point list
    if (!isClockwise(polyList)) {
      polyList.reverse()
    }

    for (i = 0; i < polyList.length; i++) {
      aPoint = polyList[i]
      aBPoint = new BorderPoint()
      aBPoint.id = -1
      aBPoint.point = aPoint
      borderList.push(aBPoint)
    }

    //---- Insert points to border list
    newBorderList = Contour.insertEndPoint2Border(Contour._endPointList, borderList)

    //---- Tracing polygons
    aPolygonList = Contour.tracingPolygons_Extent(LineList, newBorderList, aBound, contour)

    return aPolygonList
  }

  /**
   * Create contour polygons from borders
   *
   * @param S0 input grid data array
   * @param cLineList contour lines
   * @param borderList borders
   * @param aBound extent
   * @param contour contour values
   * @return contour polygons
   */
  private static createBorderContourPolygons(
    S0: number[][],
    cLineList: PolyLine[],
    borderList: Border[],
    aBound: Extent,
    contour: number[]
  ): Polygon[] {
    let aPolygonList: Polygon[] = [],
      newPolygonList: Polygon[] = []
    let newBPList: BorderPoint[]
    let bPList: BorderPoint[] = []
    let PList: PointD[] = []
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
      if (aBorder.getLineNum() === 1) {
        //The border has just one line
        aBLine = aBorder.lineList[0]
        PList = aBLine.pointList
        if (!isClockwise(PList)) {
          //Make sure the point list is clockwise
          PList.reverse()
        }

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
            aPolygon.highValue = aValue
            aPolygon.lowValue = aValue
            aPolygon.extent = new Extent()
            aPolygon.area = getExtentAndArea(PList, aPolygon.extent)
            aPolygon.startPointIdx = 0
            aPolygon.isClockWise = true
            aPolygon.outLine.type = 'Border'
            aPolygon.outLine.value = aValue
            aPolygon.outLine.borderIdx = i
            aPolygon.outLine.pointList = PList
            aPolygonList.push(aPolygon)
          }
        } //Has contour lines in this border
        else {
          //Insert the border points of the contour lines to the border point list of the border
          newBPList = Contour.insertPoint2Border(bPList, aBorderList)
          //aPolygonList = TracingPolygons(lineList, newBPList, aBound, contour);
          aPolygonList = Contour.tracingPolygons_Line_Border(lineList, newBPList)
        }
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
          aPolygon = new Polygon()
          aijP = aBLine.ijPointList[0]
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
            aPolygon.highValue = aValue
            aPolygon.lowValue = aValue
            aPolygon.area = getExtentAndArea(PList, aPolygon.extent)
            aPolygon.startPointIdx = 0
            aPolygon.isClockWise = true
            aPolygon.outLine.type = 'Border'
            aPolygon.outLine.value = aValue
            aPolygon.outLine.borderIdx = i
            aPolygon.outLine.pointList = PList
            aPolygonList.push(aPolygon)
          }
        } else {
          pNums = []
          newBPList = Contour.insertPoint2Border_Ring(S0, bPList, aBorder, pNums)
          aPolygonList = Contour.tracingPolygons_Ring(lineList, newBPList, aBorder, contour, pNums)
          //aPolygonList = TracingPolygons(lineList, newBPList, contour);
        }
      }
      Contour.addAll(aPolygonList, newPolygonList)
    }

    return newPolygonList
  }

  /**
   * Judge if a point is in a polygon
   *
   * @param aPolygon polygon
   * @param aPoint point
   * @return if the point is in the polygon
   */
  public static pointInPolygon(aPolygon: Polygon, aPoint: PointD): boolean {
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
   * Clip polylines with a border polygon
   *
   * @param polylines polyline list
   * @param clipPList clipping border point list
   * @return clipped polylines
   */
  public static clipPolylines(polylines: PolyLine[], clipPList: PointD[]): PolyLine[] {
    let newPolylines: PolyLine[] = []
    for (let aPolyline of polylines) {
      Contour.addAll(Contour.cutPolyline(aPolyline, clipPList), newPolylines)
    }

    return newPolylines
  }

  /**
   * Clip polygons with a border polygon
   *
   * @param polygons polygon list
   * @param clipPList clipping border point list
   * @return clipped polygons
   */
  public static clipPolygons(polygons: Polygon[], clipPList: PointD[]): Polygon[] {
    let newPolygons: Polygon[] = []
    for (let i = 0; i < polygons.length; i++) {
      let aPolygon = polygons[i]
      if (aPolygon.hasHoles()) {
        Contour.addAll(Contour.cutPolygon_Hole(aPolygon, clipPList), newPolygons)
      } else {
        Contour.addAll(Contour.cutPolygon(aPolygon, clipPList), newPolygons)
      }
    }

    //Sort polygons with bording rectangle area
    let outPolygons: Polygon[] = []
    let isInserted: boolean
    for (let i = 0; i < newPolygons.length; i++) {
      let aPolygon = newPolygons[i]
      isInserted = false
      for (let j = 0; j < outPolygons.length; j++) {
        if (aPolygon.area > outPolygons[j].area) {
          outPolygons.splice(j, 0, aPolygon)
          isInserted = true
          break
        }
      }

      if (!isInserted) {
        outPolygons.push(aPolygon)
      }
    }

    return outPolygons
  }

  private static traceIsoline_UndefData(
    i1: number,
    i2: number,
    H: number[][],
    S: number[][],
    j1: number,
    j2: number,
    X: number[],
    Y: number[],
    a2x: number,
    ij3: number[],
    a3xy: number[],
    IsS: boolean[]
  ): boolean {
    let canTrace = true
    let a3x = 0,
      a3y = 0
    let i3 = 0,
      j3 = 0
    let isS = true
    if (i1 < i2) {
      //---- Trace from bottom
      if (H[i2][j2] !== -2 && H[i2][j2 + 1] !== -2) {
        if (H[i2][j2] < H[i2][j2 + 1]) {
          a3x = X[j2]
          a3y = Y[i2] + H[i2][j2] * (Y[i2 + 1] - Y[i2])
          i3 = i2
          j3 = j2
          H[i3][j3] = -2
          isS = false
        } else {
          a3x = X[j2 + 1]
          a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2])
          i3 = i2
          j3 = j2 + 1
          H[i3][j3] = -2
          isS = false
        }
      } else if (H[i2][j2] !== -2 && H[i2][j2 + 1] === -2) {
        a3x = X[j2]
        a3y = Y[i2] + H[i2][j2] * (Y[i2 + 1] - Y[i2])
        i3 = i2
        j3 = j2
        H[i3][j3] = -2
        isS = false
      } else if (H[i2][j2] === -2 && H[i2][j2 + 1] !== -2) {
        a3x = X[j2 + 1]
        a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2])
        i3 = i2
        j3 = j2 + 1
        H[i3][j3] = -2
        isS = false
      } else if (S[i2 + 1][j2] !== -2) {
        a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2])
        a3y = Y[i2 + 1]
        i3 = i2 + 1
        j3 = j2
        S[i3][j3] = -2
        isS = true
      } else {
        canTrace = false
      }
    } else if (j1 < j2) {
      //---- Trace from left
      if (S[i2][j2] !== -2 && S[i2 + 1][j2] !== -2) {
        if (S[i2][j2] < S[i2 + 1][j2]) {
          a3x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2])
          a3y = Y[i2]
          i3 = i2
          j3 = j2
          S[i3][j3] = -2
          isS = true
        } else {
          a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2])
          a3y = Y[i2 + 1]
          i3 = i2 + 1
          j3 = j2
          S[i3][j3] = -2
          isS = true
        }
      } else if (S[i2][j2] !== -2 && S[i2 + 1][j2] === -2) {
        a3x = X[j2] + S[i2][j2] * (X[j2 + 1] - X[j2])
        a3y = Y[i2]
        i3 = i2
        j3 = j2
        S[i3][j3] = -2
        isS = true
      } else if (S[i2][j2] === -2 && S[i2 + 1][j2] !== -2) {
        a3x = X[j2] + S[i2 + 1][j2] * (X[j2 + 1] - X[j2])
        a3y = Y[i2 + 1]
        i3 = i2 + 1
        j3 = j2
        S[i3][j3] = -2
        isS = true
      } else if (H[i2][j2 + 1] !== -2) {
        a3x = X[j2 + 1]
        a3y = Y[i2] + H[i2][j2 + 1] * (Y[i2 + 1] - Y[i2])
        i3 = i2
        j3 = j2 + 1
        H[i3][j3] = -2
        isS = false
      } else {
        canTrace = false
      }
    } else if (X[j2] < a2x) {
      //---- Trace from top
      if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] !== -2) {
        if (H[i2 - 1][j2] > H[i2 - 1][j2 + 1]) {
          //---- < changed to >
          a3x = X[j2]
          a3y = Y[i2 - 1] + H[i2 - 1][j2] * (Y[i2] - Y[i2 - 1])
          i3 = i2 - 1
          j3 = j2
          H[i3][j3] = -2
          isS = false
        } else {
          a3x = X[j2 + 1]
          a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * (Y[i2] - Y[i2 - 1])
          i3 = i2 - 1
          j3 = j2 + 1
          H[i3][j3] = -2
          isS = false
        }
      } else if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] === -2) {
        a3x = X[j2]
        a3y = Y[i2 - 1] + H[i2 - 1][j2] * (Y[i2] - Y[i2 - 1])
        i3 = i2 - 1
        j3 = j2
        H[i3][j3] = -2
        isS = false
      } else if (H[i2 - 1][j2] === -2 && H[i2 - 1][j2 + 1] !== -2) {
        a3x = X[j2 + 1]
        a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * (Y[i2] - Y[i2 - 1])
        i3 = i2 - 1
        j3 = j2 + 1
        H[i3][j3] = -2
        isS = false
      } else if (S[i2 - 1][j2] !== -2) {
        a3x = X[j2] + S[i2 - 1][j2] * (X[j2 + 1] - X[j2])
        a3y = Y[i2 - 1]
        i3 = i2 - 1
        j3 = j2
        S[i3][j3] = -2
        isS = true
      } else {
        canTrace = false
      }
    } //---- Trace from right
    else {
      if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] !== -2) {
        if (S[i2 + 1][j2 - 1] > S[i2][j2 - 1]) {
          //---- < changed to >
          a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * (X[j2] - X[j2 - 1])
          a3y = Y[i2 + 1]
          i3 = i2 + 1
          j3 = j2 - 1
          S[i3][j3] = -2
          isS = true
        } else {
          a3x = X[j2 - 1] + S[i2][j2 - 1] * (X[j2] - X[j2 - 1])
          a3y = Y[i2]
          i3 = i2
          j3 = j2 - 1
          S[i3][j3] = -2
          isS = true
        }
      } else if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] === -2) {
        a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * (X[j2] - X[j2 - 1])
        a3y = Y[i2 + 1]
        i3 = i2 + 1
        j3 = j2 - 1
        S[i3][j3] = -2
        isS = true
      } else if (S[i2 + 1][j2 - 1] === -2 && S[i2][j2 - 1] !== -2) {
        a3x = X[j2 - 1] + S[i2][j2 - 1] * (X[j2] - X[j2 - 1])
        a3y = Y[i2]
        i3 = i2
        j3 = j2 - 1
        S[i3][j3] = -2
        isS = true
      } else if (H[i2][j2 - 1] !== -2) {
        a3x = X[j2 - 1]
        a3y = Y[i2] + H[i2][j2 - 1] * (Y[i2 + 1] - Y[i2])
        i3 = i2
        j3 = j2 - 1
        H[i3][j3] = -2
        isS = false
      } else {
        canTrace = false
      }
    }

    ij3[0] = i3
    ij3[1] = j3
    a3xy[0] = a3x
    a3xy[1] = a3y
    IsS[0] = isS

    return canTrace
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
                if (
                  Contour.traceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)
                ) {
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
                if (
                  Contour.traceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)
                ) {
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
            if (Contour.traceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
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
            if (Contour.traceIsoline_UndefData(i1, i2, H, S, j1, j2, X, Y, a2x, ij3, a3xy, IsS)) {
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

  private static traceIsoline(
    i1: number,
    i2: number,
    H: number[][],
    S: number[][],
    j1: number,
    j2: number,
    X: number[],
    Y: number[],
    nx: number,
    ny: number,
    a2x: number
  ): any[] {
    let i3: number, j3: number
    let a3x: number, a3y: number
    if (i1 < i2) {
      //---- Trace from bottom
      if (H[i2][j2] !== -2 && H[i2][j2 + 1] !== -2) {
        if (H[i2][j2] < H[i2][j2 + 1]) {
          a3x = X[j2]
          a3y = Y[i2] + H[i2][j2] * ny
          i3 = i2
          j3 = j2
          H[i3][j3] = -2
        } else {
          a3x = X[j2 + 1]
          a3y = Y[i2] + H[i2][j2 + 1] * ny
          i3 = i2
          j3 = j2 + 1
          H[i3][j3] = -2
        }
      } else if (H[i2][j2] !== -2 && H[i2][j2 + 1] === -2) {
        a3x = X[j2]
        a3y = Y[i2] + H[i2][j2] * ny
        i3 = i2
        j3 = j2
        H[i3][j3] = -2
      } else if (H[i2][j2] === -2 && H[i2][j2 + 1] !== -2) {
        a3x = X[j2 + 1]
        a3y = Y[i2] + H[i2][j2 + 1] * ny
        i3 = i2
        j3 = j2 + 1
        H[i3][j3] = -2
      } else {
        a3x = X[j2] + S[i2 + 1][j2] * nx
        a3y = Y[i2 + 1]
        i3 = i2 + 1
        j3 = j2
        S[i3][j3] = -2
      }
    } else if (j1 < j2) {
      //---- Trace from left
      if (S[i2][j2] !== -2 && S[i2 + 1][j2] !== -2) {
        if (S[i2][j2] < S[i2 + 1][j2]) {
          a3x = X[j2] + S[i2][j2] * nx
          a3y = Y[i2]
          i3 = i2
          j3 = j2
          S[i3][j3] = -2
        } else {
          a3x = X[j2] + S[i2 + 1][j2] * nx
          a3y = Y[i2 + 1]
          i3 = i2 + 1
          j3 = j2
          S[i3][j3] = -2
        }
      } else if (S[i2][j2] !== -2 && S[i2 + 1][j2] === -2) {
        a3x = X[j2] + S[i2][j2] * nx
        a3y = Y[i2]
        i3 = i2
        j3 = j2
        S[i3][j3] = -2
      } else if (S[i2][j2] === -2 && S[i2 + 1][j2] !== -2) {
        a3x = X[j2] + S[i2 + 1][j2] * nx
        a3y = Y[i2 + 1]
        i3 = i2 + 1
        j3 = j2
        S[i3][j3] = -2
      } else {
        a3x = X[j2 + 1]
        a3y = Y[i2] + H[i2][j2 + 1] * ny
        i3 = i2
        j3 = j2 + 1
        H[i3][j3] = -2
      }
    } else if (X[j2] < a2x) {
      //---- Trace from top
      if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] !== -2) {
        if (H[i2 - 1][j2] > H[i2 - 1][j2 + 1]) {
          //---- < changed to >
          a3x = X[j2]
          a3y = Y[i2 - 1] + H[i2 - 1][j2] * ny
          i3 = i2 - 1
          j3 = j2
          H[i3][j3] = -2
        } else {
          a3x = X[j2 + 1]
          a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * ny
          i3 = i2 - 1
          j3 = j2 + 1
          H[i3][j3] = -2
        }
      } else if (H[i2 - 1][j2] !== -2 && H[i2 - 1][j2 + 1] === -2) {
        a3x = X[j2]
        a3y = Y[i2 - 1] + H[i2 - 1][j2] * ny
        i3 = i2 - 1
        j3 = j2
        H[i3][j3] = -2
      } else if (H[i2 - 1][j2] === -2 && H[i2 - 1][j2 + 1] !== -2) {
        a3x = X[j2 + 1]
        a3y = Y[i2 - 1] + H[i2 - 1][j2 + 1] * ny
        i3 = i2 - 1
        j3 = j2 + 1
        H[i3][j3] = -2
      } else {
        a3x = X[j2] + S[i2 - 1][j2] * nx
        a3y = Y[i2 - 1]
        i3 = i2 - 1
        j3 = j2
        S[i3][j3] = -2
      }
    } //---- Trace from right
    else {
      if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] !== -2) {
        if (S[i2 + 1][j2 - 1] > S[i2][j2 - 1]) {
          //---- < changed to >
          a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * nx
          a3y = Y[i2 + 1]
          i3 = i2 + 1
          j3 = j2 - 1
          S[i3][j3] = -2
        } else {
          a3x = X[j2 - 1] + S[i2][j2 - 1] * nx
          a3y = Y[i2]
          i3 = i2
          j3 = j2 - 1
          S[i3][j3] = -2
        }
      } else if (S[i2 + 1][j2 - 1] !== -2 && S[i2][j2 - 1] === -2) {
        a3x = X[j2 - 1] + S[i2 + 1][j2 - 1] * nx
        a3y = Y[i2 + 1]
        i3 = i2 + 1
        j3 = j2 - 1
        S[i3][j3] = -2
      } else if (S[i2 + 1][j2 - 1] === -2 && S[i2][j2 - 1] !== -2) {
        a3x = X[j2 - 1] + S[i2][j2 - 1] * nx
        a3y = Y[i2]
        i3 = i2
        j3 = j2 - 1
        S[i3][j3] = -2
      } else {
        a3x = X[j2 - 1]
        a3y = Y[i2] + H[i2][j2 - 1] * ny
        i3 = i2
        j3 = j2 - 1
        H[i3][j3] = -2
      }
    }

    return [i3, j3, a3x, a3y]
  }

  private static isoline_Bottom(
    S0: number[][],
    X: number[],
    Y: number[],
    W: number,
    nx: number,
    ny: number,
    S: number[][],
    H: number[][]
  ): PolyLine[] {
    let bLineList: PolyLine[] = []
    let m: number, n: number, j: number
    m = S0.length
    n = S0[0].length

    let i1: number,
      i2: number,
      j1 = 0,
      j2: number,
      i3: number,
      j3: number
    let a2x: number, a2y: number, a3x: number, a3y: number
    let returnVal: any[]
    let aPoint: PointD = new PointD()
    let aLine: PolyLine = new PolyLine()
    for (
      j = 0;
      j < n - 1;
      j++ //---- Trace isoline from bottom
    ) {
      if (S[0][j] !== -2) {
        //---- Has tracing value
        let pointList: PointD[] = []
        i2 = 0
        j2 = j
        a2x = X[j] + S[0][j] * nx //---- x of first point
        a2y = Y[0] //---- y of first point
        i1 = -1
        aPoint.x = a2x
        aPoint.y = a2y
        pointList.push(aPoint)
        while (true) {
          returnVal = Contour.traceIsoline(i1, i2, H, S, j1, j2, X, Y, nx, ny, a2x)
          i3 = parseInt(returnVal[0])
          j3 = parseInt(returnVal[1])
          a3x = parseFloat(returnVal[2].toString())
          a3y = parseFloat(returnVal[3].toString())
          aPoint.x = a3x
          aPoint.y = a3y
          pointList.push(aPoint)
          if (i3 === m - 1 || j3 === n - 1 || a3y === Y[0] || a3x === X[0]) {
            break
          }

          a2x = a3x
          //a2y = a3y;
          i1 = i2
          j1 = j2
          i2 = i3
          j2 = j3
        }
        S[0][j] = -2
        if (pointList.length > 4) {
          aLine.value = W
          aLine.type = 'Bottom'
          aLine.pointList = []
          Contour.addAll(pointList, aLine.pointList)
          bLineList.push(aLine)
        }
      }
    }

    return bLineList
  }

  private static isoline_Left(
    S0: number[][],
    X: number[],
    Y: number[],
    W: number,
    nx: number,
    ny: number,
    S: number[][],
    H: number[][]
  ): PolyLine[] {
    let lLineList: PolyLine[] = []
    let m: number, n: number, i: number
    m = S0.length
    n = S0[0].length

    let i1: number, i2: number, j1: number, j2: number, i3: number, j3: number
    let a2x: number, a2y: number, a3x: number, a3y: number
    let returnVal: any[]
    let aPoint: PointD = new PointD()
    let aLine: PolyLine = new PolyLine()
    for (
      i = 0;
      i < m - 1;
      i++ //---- Trace isoline from Left
    ) {
      if (H[i][0] !== -2) {
        let pointList: PointD[] = []
        i2 = i
        j2 = 0
        a2x = X[0]
        a2y = Y[i] + H[i][0] * ny
        j1 = -1
        i1 = i2
        aPoint.x = a2x
        aPoint.y = a2y
        pointList.push(aPoint)
        while (true) {
          returnVal = Contour.traceIsoline(i1, i2, H, S, j1, j2, X, Y, nx, ny, a2x)
          i3 = parseInt(returnVal[0])
          j3 = parseInt(returnVal[1])
          a3x = parseFloat(returnVal[2])
          a3y = parseFloat(returnVal[3])
          aPoint.x = a3x
          aPoint.y = a3y
          pointList.push(aPoint)
          if (i3 === m - 1 || j3 === n - 1 || a3y === Y[0] || a3x === X[0]) {
            break
          }

          a2x = a3x
          //a2y = a3y;
          i1 = i2
          j1 = j2
          i2 = i3
          j2 = j3
        }
        if (pointList.length > 4) {
          aLine.value = W
          aLine.type = 'Left'
          aLine.pointList = []
          Contour.addAll(pointList, aLine.pointList)
          lLineList.push(aLine)
        }
      }
    }

    return lLineList
  }

  private static isoline_Top(
    S0: number[][],
    X: number[],
    Y: number[],
    W: number,
    nx: number,
    ny: number,
    S: number[][],
    H: number[][]
  ): PolyLine[] {
    let tLineList: PolyLine[] = []
    let m: number, n: number, j: number
    m = S0.length
    n = S0[0].length

    let i1: number, i2: number, j1: number, j2: number, i3: number, j3: number
    let a2x: number, a2y: number, a3x: number, a3y: number
    let returnVal: any[]
    let aPoint: PointD = new PointD()
    let aLine: PolyLine = new PolyLine()
    for (j = 0; j < n - 1; j++) {
      if (S[m - 1][j] !== -2) {
        let pointList: PointD[] = []
        i2 = m - 1
        j2 = j
        a2x = X[j] + S[i2][j] * nx
        a2y = Y[i2]
        i1 = i2
        j1 = j2
        aPoint.x = a2x
        aPoint.y = a2y
        pointList.push(aPoint)
        while (true) {
          returnVal = Contour.traceIsoline(i1, i2, H, S, j1, j2, X, Y, nx, ny, a2x)
          i3 = parseInt(returnVal[0])
          j3 = parseInt(returnVal[1])
          a3x = parseFloat(returnVal[2])
          a3y = parseFloat(returnVal[3])
          aPoint.x = a3x
          aPoint.y = a3y
          pointList.push(aPoint)
          if (i3 === m - 1 || j3 === n - 1 || a3y === Y[0] || a3x === X[0]) {
            break
          }

          a2x = a3x
          //a2y = a3y;
          i1 = i2
          j1 = j2
          i2 = i3
          j2 = j3
        }
        S[m - 1][j] = -2
        if (pointList.length > 4) {
          aLine.value = W
          aLine.type = 'Top'
          aLine.pointList = []
          Contour.addAll(pointList, aLine.pointList)
          tLineList.push(aLine)
        }
      }
    }

    return tLineList
  }

  private static isoline_Right(
    S0: number[][],
    X: number[],
    Y: number[],
    W: number,
    nx: number,
    ny: number,
    S: number[][],
    H: number[][]
  ): PolyLine[] {
    let rLineList: PolyLine[] = []
    let m: number, n: number, i: number
    m = S0.length
    n = S0[0].length

    let i1: number, i2: number, j1: number, j2: number, i3: number, j3: number
    let a2x: number, a2y: number, a3x: number, a3y: number
    let returnVal: any[]
    let aPoint: PointD = new PointD()
    let aLine: PolyLine = new PolyLine()
    for (i = 0; i < m - 1; i++) {
      if (H[i][n - 1] !== -2) {
        let pointList: PointD[] = []
        i2 = i
        j2 = n - 1
        a2x = X[j2]
        a2y = Y[i] + H[i][j2] * ny
        j1 = j2
        i1 = i2
        aPoint.x = a2x
        aPoint.y = a2y
        pointList.push(aPoint)
        while (true) {
          returnVal = Contour.traceIsoline(i1, i2, H, S, j1, j2, X, Y, nx, ny, a2x)
          i3 = parseInt(returnVal[0])
          j3 = parseInt(returnVal[1])
          a3x = parseFloat(returnVal[2])
          a3y = parseFloat(returnVal[3])
          aPoint.x = a3x
          aPoint.y = a3y
          pointList.push(aPoint)
          if (i3 === m - 1 || j3 === n - 1 || a3y === Y[0] || a3x === X[0]) {
            break
          }

          a2x = a3x
          //a2y = a3y;
          i1 = i2
          j1 = j2
          i2 = i3
          j2 = j3
        }
        if (pointList.length > 4) {
          aLine.value = W
          aLine.type = 'Right'
          aLine.pointList = []
          Contour.addAll(pointList, aLine.pointList)
          rLineList.push(aLine)
        }
      }
    }

    return rLineList
  }

  private static isoline_Close(
    S0: number[][],
    X: number[],
    Y: number[],
    W: number,
    nx: number,
    ny: number,
    S: number[][],
    H: number[][]
  ): PolyLine[] {
    let cLineList: PolyLine[] = []
    let m: number, n: number, i: number, j: number
    m = S0.length
    n = S0[0].length
    let i1: number, i2: number, j1: number, j2: number, i3: number, j3: number
    let a2x: number, a2y: number, a3x: number, a3y: number, sx: number, sy: number
    let returnVal: any[]
    let aPoint: PointD = new PointD()
    let aLine: PolyLine = new PolyLine()
    for (i = 1; i < m - 2; i++) {
      for (j = 1; j < n - 1; j++) {
        if (H[i][j] !== -2) {
          let pointList: PointD[] = []
          i2 = i
          j2 = j
          a2x = X[j2]
          a2y = Y[i] + H[i][j2] * ny
          j1 = 0
          i1 = i2
          sx = a2x
          sy = a2y
          aPoint.x = a2x
          aPoint.y = a2y
          pointList.push(aPoint)
          while (true) {
            returnVal = Contour.traceIsoline(i1, i2, H, S, j1, j2, X, Y, nx, ny, a2x)
            i3 = parseInt(returnVal[0])
            j3 = parseInt(returnVal[1])
            a3x = parseFloat(returnVal[2])
            a3y = parseFloat(returnVal[3])
            if (i3 === 0 && j3 === 0) {
              break
            }

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
            if (i2 === m - 1 || j2 === n - 1) {
              break
            }
          }
          H[i][j] = -2
          if (pointList.length > 4) {
            aLine.value = W
            aLine.type = 'Close'
            aLine.pointList = []
            Contour.addAll(pointList, aLine.pointList)
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
          a2x = X[j2] + S[i][j] * nx
          a2y = Y[i]
          j1 = j2
          i1 = 0
          sx = a2x
          sy = a2y
          aPoint.x = a2x
          aPoint.y = a2y
          pointList.push(aPoint)
          while (true) {
            returnVal = Contour.traceIsoline(i1, i2, H, S, j1, j2, X, Y, nx, ny, a2x)
            i3 = parseInt(returnVal[0])
            j3 = parseInt(returnVal[1])
            a3x = parseFloat(returnVal[2])
            a3y = parseFloat(returnVal[3])
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
            if (i2 === m - 1 || j2 === n - 1) {
              break
            }
          }
          S[i][j] = -2
          if (pointList.length > 4) {
            aLine.value = W
            aLine.type = 'Close'
            aLine.pointList = []
            Contour.addAll(pointList, aLine.pointList)
            cLineList.push(aLine)
          }
        }
      }
    }

    return cLineList
  }

  private static tracingPolygons_Extent(
    LineList: PolyLine[],
    borderList: BorderPoint[],
    bBound: Extent,
    contour: number[]
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

    Contour.addAll(LineList, aLineList)

    //---- Tracing border polygon
    let aPList: PointD[]
    let newPList: PointD[] = []
    let bP: BorderPoint
    let timesArray: number[] = []
    timesArray.length = borderList.length - 1
    for (i = 0; i < timesArray.length; i++) {
      timesArray[i] = 0
    }

    let pIdx: number, pNum: number, vNum: number
    let aValue = 0,
      bValue = 0
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
        while (true) {
          bP = borderList[pIdx]
          if (bP.id === -1) {
            //---- Not endpoint of contour
            if (timesArray[pIdx] === 1) {
              break
            }

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
            } else if (aValue === bValue) {
              if (aLine.value > aValue) {
                bValue = aLine.value
              } else if (aLine.value < aValue) {
                aValue = aLine.value
              }

              vNum += 1
            }
            newPList = []
            Contour.addAll(aLine.pointList, newPList)
            aPoint = newPList[0]
            //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
            //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              //---- Start point
              newPList.reverse()
            }
            Contour.addAll(newPList, aPList)
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
              aPolygon.lowValue = aValue
              aPolygon.highValue = bValue
              aBound = new Extent()
              aPolygon.area = getExtentAndArea(aPList, aBound)
              aPolygon.isClockWise = true
              aPolygon.startPointIdx = lineBorderList.length - 1
              aPolygon.extent = aBound
              aPolygon.outLine.pointList = aPList
              aPolygon.outLine.value = aValue
              aPolygon.isHighCenter = true
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
        while (true) {
          bP = borderList[pIdx]
          if (bP.id === -1) {
            //---- Not endpoint of contour
            if (timesArray[pIdx] === 1) {
              break
            }
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
            } else if (aValue === bValue) {
              if (aLine.value > aValue) {
                bValue = aLine.value
              } else if (aLine.value < aValue) {
                aValue = aLine.value
              }

              vNum += 1
            }
            newPList = []
            Contour.addAll(aLine.pointList, newPList)
            aPoint = newPList[0]
            //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
            //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              //---- Start point
              newPList.reverse()
            }

            Contour.addAll(newPList, aPList)
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
              aPolygon.lowValue = aValue
              aPolygon.highValue = bValue
              aBound = new Extent()
              aPolygon.area = getExtentAndArea(aPList, aBound)
              aPolygon.isClockWise = false
              aPolygon.startPointIdx = lineBorderList.length - 1
              aPolygon.extent = aBound
              aPolygon.outLine.pointList = aPList
              aPolygon.outLine.value = aValue
              aPolygon.isHighCenter = true
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
        aPolygon.lowValue = aLine.value
        aPolygon.highValue = aLine.value
        aBound = new Extent()
        aPolygon.area = getExtentAndArea(aLine.pointList, aBound)
        aPolygon.isClockWise = isClockwise(aLine.pointList)
        aPolygon.extent = aBound
        aPolygon.outLine = aLine
        aPolygon.isHighCenter = true

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
    let cBound1: Extent, cBound2: Extent
    if (aPolygonList.length > 0) {
      let outPIdx: number
      let IsSides: boolean
      let IfSameValue = false //---- If all boder polygon lines have same value
      aPolygon = aPolygonList[0]
      if (aPolygon.lowValue === aPolygon.highValue) {
        //IsSides = false;
        outPIdx = aPolygon.startPointIdx
        while (true) {
          if (aPolygon.isClockWise) {
            outPIdx = outPIdx - 1
            if (outPIdx === -1) {
              outPIdx = lineBorderList.length - 1
            }
          } else {
            outPIdx = outPIdx + 1
            if (outPIdx === lineBorderList.length) {
              outPIdx = 0
            }
          }
          bP = lineBorderList[outPIdx]
          aLine = aLineList[bP.id]
          if (aLine.value === aPolygon.lowValue) {
            if (outPIdx === aPolygon.startPointIdx) {
              IfSameValue = true
              break
            } else {
              continue
            }
          } else {
            IfSameValue = false
            break
          }
        }
      }

      if (IfSameValue) {
        if (cPolygonlist.length > 0) {
          let cPolygon: Polygon = cPolygonlist[0]
          cBound1 = cPolygon.extent
          for (i = 0; i < aPolygonList.length; i++) {
            aPolygon = aPolygonList[i]
            cBound2 = aPolygon.extent
            if (
              cBound1.xMin > cBound2.xMin &&
              cBound1.yMin > cBound2.yMin &&
              cBound1.xMax < cBound2.xMax &&
              cBound1.yMax < cBound2.yMax
            ) {
              aPolygon.isHighCenter = false
            } else {
              aPolygon.isHighCenter = true
            }
            //aPolygonList.set(i, aPolygon);
          }
        } else {
          let tf = true //---- Temperal solution, not finished
          for (i = 0; i < aPolygonList.length; i++) {
            aPolygon = aPolygonList[i]
            tf = !tf
            aPolygon.isHighCenter = tf
            //aPolygonList[i] = aPolygon;
          }
        }
      } else {
        for (i = 0; i < aPolygonList.length; i++) {
          aPolygon = aPolygonList[i]
          if (aPolygon.lowValue === aPolygon.highValue) {
            IsSides = false
            outPIdx = aPolygon.startPointIdx
            while (true) {
              if (aPolygon.isClockWise) {
                outPIdx = outPIdx - 1
                if (outPIdx === -1) {
                  outPIdx = lineBorderList.length - 1
                }
              } else {
                outPIdx = outPIdx + 1
                if (outPIdx === lineBorderList.length) {
                  outPIdx = 0
                }
              }
              bP = lineBorderList[outPIdx]
              aLine = aLineList[bP.id]
              if (aLine.value === aPolygon.lowValue) {
                if (outPIdx === aPolygon.startPointIdx) {
                  break
                } else {
                  IsSides = !IsSides
                  continue
                }
              } else {
                if (IsSides) {
                  if (aLine.value < aPolygon.lowValue) {
                    aPolygon.isHighCenter = false
                    //aPolygonList.push(i, aPolygon);
                    //aPolygonList.remove(i + 1);
                  }
                } else if (aLine.value > aPolygon.lowValue) {
                  aPolygon.isHighCenter = false
                  //aPolygonList.push(i, aPolygon);
                  //aPolygonList.remove(i + 1);
                }
                break
              }
            }
          }
        }
      }
    } //Add border polygon
    else {
      //Get max & min contour values
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
      aLine = new PolyLine()
      aLine.type = 'Border'
      aLine.value = contour[0]
      aPolygon.isHighCenter = false
      if (cPolygonlist.length > 0) {
        if (cPolygonlist[0].lowValue === max) {
          aLine.value = contour[contour.length - 1]
          aPolygon.isHighCenter = true
        }
      }
      newPList = []
      aPoint = new PointD()
      aPoint.x = bBound.xMin
      aPoint.y = bBound.yMin
      newPList.push(aPoint)
      aPoint = new PointD()
      aPoint.x = bBound.xMin
      aPoint.y = bBound.yMax
      newPList.push(aPoint)
      aPoint = new PointD()
      aPoint.x = bBound.xMax
      aPoint.y = bBound.yMax
      newPList.push(aPoint)
      aPoint = new PointD()
      aPoint.x = bBound.xMax
      aPoint.y = bBound.yMin
      newPList.push(aPoint)
      newPList.push(newPList[0])
      aLine.pointList = []
      Contour.addAll(newPList, aLine.pointList)

      if (aLine.pointList.length > 0) {
        aPolygon.lowValue = aLine.value
        aPolygon.highValue = aLine.value
        aBound = new Extent()
        aPolygon.area = getExtentAndArea(aLine.pointList, aBound)
        aPolygon.isClockWise = isClockwise(aLine.pointList)
        aPolygon.extent = aBound
        aPolygon.outLine = aLine
        //aPolygon.isHighCenter = false;
        aPolygonList.push(aPolygon)
      }
    }

    //---- Add close polygons to form total polygons list
    Contour.addAll(cPolygonlist, aPolygonList)

    //---- Juge isHighCenter for close polygons
    let polygonNum = aPolygonList.length
    let bPolygon: Polygon
    for (i = polygonNum - 1; i >= 0; i--) {
      aPolygon = aPolygonList[i]
      if (aPolygon.outLine.type === 'Close') {
        cBound1 = aPolygon.extent
        aValue = aPolygon.lowValue
        aPoint = aPolygon.outLine.pointList[0]
        for (j = i - 1; j >= 0; j--) {
          bPolygon = aPolygonList[j]
          cBound2 = bPolygon.extent
          bValue = bPolygon.lowValue
          newPList = []
          Contour.addAll(bPolygon.outLine.pointList, newPList)
          if (pointInPolygonByPList(newPList, aPoint)) {
            if (
              cBound1.xMin > cBound2.xMin &&
              cBound1.yMin > cBound2.yMin &&
              cBound1.xMax < cBound2.xMax &&
              cBound1.yMax < cBound2.yMax
            ) {
              if (aValue < bValue) {
                aPolygon.isHighCenter = false
              } else if (aValue === bValue) {
                if (bPolygon.isHighCenter) {
                  aPolygon.isHighCenter = false
                }
              }
              break
            }
          }
        }
      }
    }

    return aPolygonList
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

    Contour.addAll(LineList, aLineList)
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
            Contour.addAll(aLine.pointList, newPList)
            aPoint = newPList[0]
            //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
            //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              //---- Start point
              newPList.reverse()
            }
            Contour.addAll(newPList, aPList)
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
              aPolygon.area = getExtentAndArea(aPList, aBound)
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
            Contour.addAll(aLine.pointList, newPList)
            aPoint = newPList[0]
            //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
            //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              //---- Start point
              newPList.reverse()
            }
            Contour.addAll(newPList, aPList)
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
              aPolygon.area = getExtentAndArea(aPList, aBound)
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
        aPolygon.area = getExtentAndArea(aLine.pointList, aBound)
        aPolygon.isClockWise = isClockwise(aLine.pointList)
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
    aPolygonList = Contour.judgePolygonHighCenter(aPolygonList, cPolygonlist, aLineList, borderList)

    return aPolygonList
  }

  private static tracingClipPolygons(
    inPolygon: Polygon,
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
    Contour.addAll(LineList, aLineList)

    //---- Tracing border polygon
    let aPList: PointD[]
    let newPList: PointD[] = []
    let bP: BorderPoint
    let timesArray: number[] = []
    timesArray.length = borderList.length - 1
    for (i = 0; i < timesArray.length; i++) {
      timesArray[i] = 0
    }

    let pIdx, pNum
    let lineBorderList: BorderPoint[] = []

    pNum = borderList.length - 1
    let bPoint: PointD, b1Point: PointD
    for (i = 0; i < pNum; i++) {
      if (borderList[i].id === -1) {
        continue
      }

      pIdx = i
      lineBorderList.push(borderList[i])
      //bP = borderList[pIdx];
      b1Point = borderList[pIdx].point

      //---- Clockwise tracing
      if (timesArray[pIdx] < 1) {
        aPList = []
        aPList.push(borderList[pIdx].point)
        pIdx += 1
        if (pIdx === pNum) {
          pIdx = 0
        }

        bPoint = borderList[pIdx].point.clone()
        if (borderList[pIdx].id === -1) {
          let aIdx = pIdx + 10
          for (let o = 1; o <= 10; o++) {
            if (borderList[pIdx + o].id > -1) {
              aIdx = pIdx + o - 1
              break
            }
          }
          bPoint = borderList[aIdx].point.clone()
        } else {
          bPoint.x = (bPoint.x + b1Point.x) / 2
          bPoint.y = (bPoint.y + b1Point.y) / 2
        }
        if (Contour.pointInPolygon(inPolygon, bPoint)) {
          while (true) {
            bP = borderList[pIdx]
            if (bP.id === -1) {
              //---- Not endpoint of contour
              if (timesArray[pIdx] === 1) {
                break
              }

              aPList.push(bP.point)
              timesArray[pIdx] += 1
            } //---- endpoint of contour
            else {
              if (timesArray[pIdx] === 1) {
                break
              }

              timesArray[pIdx] += 1
              aLine = aLineList[bP.id]
              newPList = []
              Contour.addAll(aLine.pointList, newPList)
              aPoint = newPList[0]

              if (!(doubleEquals(bP.point.x, aPoint.x) && doubleEquals(bP.point.y, aPoint.y))) {
                //---- Start point
                newPList.reverse()
              }
              Contour.addAll(newPList, aPList)
              for (j = 0; j < borderList.length - 1; j++) {
                if (j !== pIdx) {
                  if (borderList[j].id === bP.id) {
                    pIdx = j
                    timesArray[pIdx] += 1
                    break
                  }
                }
              }
            }

            if (pIdx === i) {
              if (aPList.length > 0) {
                aPolygon = new Polygon()
                aPolygon.isBorder = true
                aPolygon.lowValue = inPolygon.lowValue
                aPolygon.highValue = inPolygon.highValue
                aBound = new Extent()
                aPolygon.area = getExtentAndArea(aPList, aBound)
                aPolygon.isClockWise = true
                aPolygon.startPointIdx = lineBorderList.length - 1
                aPolygon.extent = aBound
                aPolygon.outLine.pointList = aPList
                aPolygon.outLine.value = inPolygon.lowValue
                aPolygon.isHighCenter = inPolygon.isHighCenter
                aPolygon.outLine.type = 'Border'
                aPolygon.holeLines = []
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
      }

      //---- Anticlockwise traceing
      pIdx = i
      if (timesArray[pIdx] < 1) {
        aPList = []
        aPList.push(borderList[pIdx].point)
        pIdx += -1
        if (pIdx === -1) {
          pIdx = pNum - 1
        }

        bPoint = borderList[pIdx].point.clone()
        if (borderList[pIdx].id === -1) {
          let aIdx = pIdx + 10
          for (let o = 1; o <= 10; o++) {
            if (borderList[pIdx + o].id > -1) {
              aIdx = pIdx + o - 1
              break
            }
          }
          bPoint = borderList[aIdx].point.clone()
        } else {
          bPoint.x = (bPoint.x + b1Point.x) / 2
          bPoint.y = (bPoint.y + b1Point.y) / 2
        }
        if (Contour.pointInPolygon(inPolygon, bPoint)) {
          while (true) {
            bP = borderList[pIdx]
            if (bP.id === -1) {
              //---- Not endpoint of contour
              if (timesArray[pIdx] === 1) {
                break
              }

              aPList.push(bP.point)
              timesArray[pIdx] += 1
            } //---- endpoint of contour
            else {
              if (timesArray[pIdx] === 1) {
                break
              }

              timesArray[pIdx] += 1
              aLine = aLineList[bP.id]
              newPList = []
              Contour.addAll(aLine.pointList, newPList)
              aPoint = newPList[0]

              if (!(doubleEquals(bP.point.x, aPoint.x) && doubleEquals(bP.point.y, aPoint.y))) {
                //---- Start point
                newPList.reverse()
              }
              Contour.addAll(newPList, aPList)
              //aPList.addAll(newPList);
              for (j = 0; j < borderList.length - 1; j++) {
                if (j !== pIdx) {
                  if (borderList[j].id === bP.id) {
                    pIdx = j
                    timesArray[pIdx] += 1
                    break
                  }
                }
              }
            }

            if (pIdx === i) {
              if (aPList.length > 0) {
                aPolygon = new Polygon()
                aPolygon.isBorder = true
                aPolygon.lowValue = inPolygon.lowValue
                aPolygon.highValue = inPolygon.highValue
                aBound = new Extent()
                aPolygon.area = getExtentAndArea(aPList, aBound)
                aPolygon.isClockWise = false
                aPolygon.startPointIdx = lineBorderList.length - 1
                aPolygon.extent = aBound
                aPolygon.outLine.pointList = aPList
                aPolygon.outLine.value = inPolygon.lowValue
                aPolygon.isHighCenter = inPolygon.isHighCenter
                aPolygon.outLine.type = 'Border'
                aPolygon.holeLines = []
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
    }

    return aPolygonList
  }

  private static judgePolygonHighCenter(
    borderPolygons: Polygon[],
    closedPolygons: Polygon[],
    aLineList: PolyLine[],
    borderList: BorderPoint[]
  ): Polygon[] {
    let i: number, j: number
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
      Contour.addAll(newPList, aLine.pointList)
      //new ArrayList<PointD>(newPList);
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
    Contour.addAll(closedPolygons, borderPolygons)
    //borderPolygons.addAll(closedPolygons);

    //---- Juge isHighCenter for close polygons
    let cBound1: Extent, cBound2: Extent
    let polygonNum = borderPolygons.length
    let bPolygon: Polygon
    for (i = 1; i < polygonNum; i++) {
      aPolygon = borderPolygons[i]
      if (aPolygon.outLine.type === 'Close') {
        cBound1 = aPolygon.extent
        //aValue = aPolygon.lowValue;
        aPoint = aPolygon.outLine.pointList[0]
        for (j = i - 1; j >= 0; j--) {
          bPolygon = borderPolygons[j]
          cBound2 = bPolygon.extent
          //bValue = bPolygon.lowValue;
          newPList = []
          Contour.addAll(bPolygon.outLine.pointList, newPList)
          //newPList = new ArrayList<PointD>(bPolygon.outLine.pointList);
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
              //                            if (aValue < bValue) {
              //                                aPolygon.isHighCenter = false;
              //                                //borderPolygons[i] = aPolygon;
              //                            } else if (aValue === bValue) {
              //                                if (!bPolygon.isHighCenter) {
              //                                    aPolygon.isHighCenter = false;
              //                                    //borderPolygons[i] = aPolygon;
              //                                }
              //                            }
              break
            }
          }
        }
      }
    }

    return borderPolygons
  }

  private static judgePolygonHighCenter_old(
    borderPolygons: Polygon[],
    closedPolygons: Polygon[],
    aLineList: PolyLine[],
    borderList: BorderPoint[]
  ): Polygon[] {
    let i: number, j: number
    let aPolygon: Polygon
    let aLine: PolyLine
    let newPList: PointD[] = []
    let aBound: Extent
    let aValue: number
    let bValue: number
    let aPoint: PointD

    if (borderPolygons.length === 0) {
      //Add border polygon
      //Get max & min contour values
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
      aLine = new PolyLine()
      aLine.type = 'Border'
      aLine.value = min
      aPolygon.isHighCenter = false
      if (closedPolygons.length > 0) {
        if (borderList[0].value >= closedPolygons[0].lowValue) {
          aLine.value = max
          aPolygon.isHighCenter = true
        }
      }
      newPList = []
      for (let aP of borderList) {
        newPList.push(aP.point)
      }
      aLine.pointList = []
      Contour.addAll(newPList, aLine.pointList)
      //aLine.pointList = new ArrayList<PointD>(newPList);

      if (aLine.pointList.length > 0) {
        aPolygon.isBorder = true
        aPolygon.lowValue = aLine.value
        aPolygon.highValue = aLine.value
        aBound = new Extent()
        aPolygon.area = getExtentAndArea(aLine.pointList, aBound)
        aPolygon.isClockWise = isClockwise(aLine.pointList)
        aPolygon.extent = aBound
        aPolygon.outLine = aLine
        aPolygon.holeLines = []
        //aPolygon.isHighCenter = false;
        borderPolygons.push(aPolygon)
      }
    }

    //---- Add close polygons to form total polygons list
    Contour.addAll(closedPolygons, borderPolygons)
    //borderPolygons.addAll(closedPolygons);

    //---- Juge isHighCenter for close polygons
    let cBound1: Extent, cBound2: Extent
    let polygonNum = borderPolygons.length
    let bPolygon: Polygon
    for (i = 1; i < polygonNum; i++) {
      aPolygon = borderPolygons[i]
      if (aPolygon.outLine.type === 'Close') {
        cBound1 = aPolygon.extent
        aValue = aPolygon.lowValue
        aPoint = aPolygon.outLine.pointList[0]
        for (j = i - 1; j >= 0; j--) {
          bPolygon = borderPolygons[j]
          cBound2 = bPolygon.extent
          bValue = bPolygon.lowValue
          newPList = []
          Contour.addAll(bPolygon.outLine.pointList, newPList)
          //newPList = new ArrayList<PointD>(bPolygon.outLine.pointList);
          if (pointInPolygonByPList(newPList, aPoint)) {
            if (
              cBound1.xMin > cBound2.xMin &&
              cBound1.yMin > cBound2.yMin &&
              cBound1.xMax < cBound2.xMax &&
              cBound1.yMax < cBound2.yMax
            ) {
              if (aValue < bValue) {
                aPolygon.isHighCenter = false
                //borderPolygons[i] = aPolygon;
              } else if (aValue === bValue) {
                if (bPolygon.isHighCenter) {
                  aPolygon.isHighCenter = false
                  //borderPolygons[i] = aPolygon;
                }
              }
              break
            }
          }
        }
      }
    }

    return borderPolygons
  }

  private static tracingPolygons_Ring(
    LineList: PolyLine[],
    borderList: BorderPoint[],
    aBorder: Border,
    contour: number[],
    pNums: number[]
  ): Polygon[] {
    let aPolygonList: Polygon[] = []
    let aLineList: PolyLine[]
    let aLine: PolyLine
    let aPoint: PointD
    let aPolygon: Polygon
    let aBound: Extent
    let i: number
    let j: number
    aLineList = []
    Contour.addAll(LineList, aLineList)
    //aLineList = new ArrayList<PolyLine>(LineList);

    //---- Tracing border polygon
    let aPList: PointD[]
    let newPList: PointD[]
    let bP: BorderPoint
    let bP1: BorderPoint
    let timesArray: number[] = []
    timesArray.length = borderList.length - 1
    for (i = 0; i < timesArray.length; i++) {
      timesArray[i] = 0
    }
    let pIdx: number
    let pNum: number
    let vNum: number
    let aValue = 0
    let bValue = 0
    let cValue = 0
    let lineBorderList: BorderPoint[] = []
    let borderIdx1: number
    let borderIdx2: number
    let innerIdx: number

    pNum = borderList.length
    for (i = 0; i < pNum; i++) {
      if (borderList[i].id === -1) {
        continue
      }
      pIdx = i
      lineBorderList.push(borderList[i])

      let sameBorderIdx = false //The two end points of the contour line are on same inner border
      //---- Clockwise traceing
      if (timesArray[pIdx] < 2) {
        bP = borderList[pIdx]
        innerIdx = bP.bInnerIdx
        aPList = []
        let bIdxList: number[] = []
        aPList.push(bP.point)
        bIdxList.push(pIdx)
        borderIdx1 = bP.borderIdx
        borderIdx2 = borderIdx1
        pIdx += 1
        innerIdx += 1
        //If pIdx = pNum Then
        //    pIdx = 0
        //End If
        if (innerIdx === pNums[borderIdx1] - 1) {
          pIdx = pIdx - (pNums[borderIdx1] - 1)
        }
        vNum = 0
        do {
          bP = borderList[pIdx]
          //---- Not endpoint of contour
          if (bP.id === -1) {
            if (timesArray[pIdx] === 1) {
              break
            }
            cValue = bP.value
            aPList.push(bP.point)
            timesArray[pIdx] += 1
            bIdxList.push(pIdx)
            //---- endpoint of contour
          } else {
            if (timesArray[pIdx] === 2) {
              break
            }
            timesArray[pIdx] += 1
            bIdxList.push(pIdx)
            aLine = aLineList[bP.id]
            //---- Set high and low value of the polygon
            if (vNum === 0) {
              aValue = aLine.value
              bValue = aLine.value
              vNum += 1
            } else if (aValue === bValue) {
              if (aLine.value > aValue) {
                bValue = aLine.value
              } else if (aLine.value < aValue) {
                aValue = aLine.value
              }
              vNum += 1
            }
            newPList = []
            Contour.addAll(aLine.pointList, newPList)
            //newPList = new ArrayList<PointD>(aLine.pointList);
            aPoint = newPList[0]
            //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
            //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Not start point
            //---- Not start point
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              newPList.reverse()
            }
            Contour.addAll(newPList, aPList)
            //aPList.addAll(newPList);
            //---- Find corresponding border point
            for (j = 0; j < borderList.length; j++) {
              if (j !== pIdx) {
                bP1 = borderList[j]
                if (bP1.id === bP.id) {
                  pIdx = j
                  innerIdx = bP1.bInnerIdx
                  timesArray[pIdx] += 1
                  bIdxList.push(pIdx)
                  borderIdx2 = bP1.borderIdx
                  if (bP.borderIdx > 0 && bP.borderIdx === bP1.borderIdx) {
                    sameBorderIdx = true
                  }
                  break
                }
              }
            }
          }

          //---- Return to start point, tracing finish
          if (pIdx === i) {
            if (aPList.length > 0) {
              if (sameBorderIdx) {
                let isTooBig = false
                let baseNum = 0
                for (let idx = 0; idx < bP.borderIdx; idx++) {
                  baseNum += pNums[idx]
                }
                let sIdx = baseNum
                let eIdx = baseNum + pNums[bP.borderIdx]
                let theIdx = sIdx
                for (let idx = sIdx; idx < eIdx; idx++) {
                  if (bIdxList.indexOf(idx) < 0) {
                    theIdx = idx
                    break
                  }
                }
                if (pointInPolygonByPList(aPList, borderList[theIdx].point)) {
                  isTooBig = true
                }

                if (isTooBig) {
                  break
                }
              }
              aPolygon = new Polygon()
              aPolygon.isBorder = true
              aPolygon.isInnerBorder = sameBorderIdx
              aPolygon.lowValue = aValue
              aPolygon.highValue = bValue
              aBound = new Extent()
              aPolygon.area = getExtentAndArea(aPList, aBound)
              aPolygon.isClockWise = true
              aPolygon.startPointIdx = lineBorderList.length - 1
              aPolygon.extent = aBound
              aPolygon.outLine.pointList = aPList
              aPolygon.outLine.value = aValue
              aPolygon.isHighCenter = true
              if (aValue === bValue) {
                if (cValue < aValue) {
                  aPolygon.isHighCenter = false
                }
              }
              aPolygon.outLine.type = 'Border'
              aPolygon.holeLines = []
              aPolygonList.push(aPolygon)
            }
            break
          }
          pIdx += 1
          innerIdx += 1
          if (borderIdx1 !== borderIdx2) {
            borderIdx1 = borderIdx2
          }

          //if (pIdx === pNum)
          //    pIdx = 0;
          if (innerIdx === pNums[borderIdx1] - 1) {
            pIdx = pIdx - (pNums[borderIdx1] - 1)
            innerIdx = 0
          }
        } while (true)
      }

      sameBorderIdx = false
      //---- Anticlockwise traceing
      pIdx = i
      if (timesArray[pIdx] < 2) {
        aPList = []
        let bIdxList: number[] = []
        bP = borderList[pIdx]
        innerIdx = bP.bInnerIdx
        aPList.push(bP.point)
        bIdxList.push(pIdx)
        borderIdx1 = bP.borderIdx
        borderIdx2 = borderIdx1
        pIdx += -1
        innerIdx += -1
        //If pIdx = -1 Then
        //    pIdx = pNum - 1
        //End If
        if (innerIdx === -1) {
          pIdx = pIdx + (pNums[borderIdx1] - 1)
        }
        vNum = 0
        do {
          bP = borderList[pIdx]
          //---- Not endpoint of contour
          if (bP.id === -1) {
            if (timesArray[pIdx] === 1) {
              break
            }
            cValue = bP.value
            aPList.push(bP.point)
            bIdxList.push(pIdx)
            timesArray[pIdx] += 1
            //---- endpoint of contour
          } else {
            if (timesArray[pIdx] === 2) {
              break
            }
            timesArray[pIdx] += 1
            bIdxList.push(pIdx)
            aLine = aLineList[bP.id]
            if (vNum === 0) {
              aValue = aLine.value
              bValue = aLine.value
              vNum += 1
            } else if (aValue === bValue) {
              if (aLine.value > aValue) {
                bValue = aLine.value
              } else if (aLine.value < aValue) {
                aValue = aLine.value
              }
              vNum += 1
            }
            newPList = []
            Contour.addAll(aLine.pointList, newPList)
            //newPList = new ArrayList<PointD>(aLine.pointList);
            aPoint = newPList[0]
            //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
            //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
            //---- Start point
            if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
              newPList.reverse()
            }
            Contour.addAll(newPList, aPList)
            //aPList.addAll(newPList);
            for (j = 0; j < borderList.length; j++) {
              if (j !== pIdx) {
                bP1 = borderList[j]
                if (bP1.id === bP.id) {
                  pIdx = j
                  innerIdx = bP1.bInnerIdx
                  timesArray[pIdx] += 1
                  bIdxList.push(pIdx)
                  borderIdx2 = bP1.borderIdx
                  if (bP.borderIdx > 0 && bP.borderIdx === bP1.borderIdx) {
                    sameBorderIdx = true
                  }
                  break
                }
              }
            }
          }

          if (pIdx === i) {
            if (aPList.length > 0) {
              if (sameBorderIdx) {
                let isTooBig = false
                let baseNum = 0
                for (let idx = 0; idx < bP.borderIdx; idx++) {
                  baseNum += pNums[idx]
                }
                let sIdx = baseNum
                let eIdx = baseNum + pNums[bP.borderIdx]
                let theIdx = sIdx
                for (let idx = sIdx; idx < eIdx; idx++) {
                  if (bIdxList.indexOf(idx) < 0) {
                    theIdx = idx
                    break
                  }
                }
                if (pointInPolygonByPList(aPList, borderList[theIdx].point)) {
                  isTooBig = true
                }

                if (isTooBig) {
                  break
                }
              }
              aPolygon = new Polygon()
              aPolygon.isBorder = true
              aPolygon.isInnerBorder = sameBorderIdx
              aPolygon.lowValue = aValue
              aPolygon.highValue = bValue
              aBound = new Extent()
              aPolygon.area = getExtentAndArea(aPList, aBound)
              aPolygon.isClockWise = false
              aPolygon.startPointIdx = lineBorderList.length - 1
              aPolygon.extent = aBound
              aPolygon.outLine.pointList = aPList
              aPolygon.outLine.value = aValue
              aPolygon.isHighCenter = true
              if (aValue === bValue) {
                if (cValue < aValue) {
                  aPolygon.isHighCenter = false
                }
              }
              aPolygon.outLine.type = 'Border'
              aPolygon.holeLines = []
              aPolygonList.push(aPolygon)
            }
            break
          }
          pIdx += -1
          innerIdx += -1
          if (borderIdx1 !== borderIdx2) {
            borderIdx1 = borderIdx2
          }
          //If pIdx = -1 Then
          //    pIdx = pNum - 1
          //End If
          if (innerIdx === -1) {
            pIdx = pIdx + pNums[borderIdx1]
            innerIdx = pNums[borderIdx1] - 1
          }
        } while (true)
      }
    }

    //---- tracing close polygons
    let cPolygonlist: Polygon[] = []
    let isInserted: boolean
    for (i = 0; i < aLineList.length; i++) {
      aLine = aLineList[i]
      if (aLine.type === 'Close') {
        aPolygon = new Polygon()
        aPolygon.isBorder = false
        aPolygon.lowValue = aLine.value
        aPolygon.highValue = aLine.value
        aBound = new Extent()
        aPolygon.area = getExtentAndArea(aLine.pointList, aBound)
        aPolygon.isClockWise = isClockwise(aLine.pointList)
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
    if (aPolygonList.length === 0) {
      aLine = new PolyLine()
      aLine.type = 'Border'
      aLine.value = contour[0]
      aLine.pointList = []
      Contour.addAll(aBorder.lineList[0].pointList, aLine.pointList)
      //aLine.pointList = new ArrayList<PointD>(aBorder.lineList[0].pointList);

      if (aLine.pointList.length > 0) {
        aPolygon = new Polygon()
        aPolygon.lowValue = aLine.value
        aPolygon.highValue = aLine.value
        aBound = new Extent()
        aPolygon.area = getExtentAndArea(aLine.pointList, aBound)
        aPolygon.isClockWise = isClockwise(aLine.pointList)
        aPolygon.extent = aBound
        aPolygon.outLine = aLine
        aPolygon.isHighCenter = false
        aPolygonList.push(aPolygon)
      }
    }

    //---- Add close polygons to form total polygons list
    Contour.addAll(cPolygonlist, aPolygonList)
    //aPolygonList.addAll(cPolygonlist);

    //---- Juge siHighCenter for close polygons
    let cBound1: Extent
    let cBound2: Extent
    let polygonNum = aPolygonList.length
    let bPolygon: Polygon
    for (i = polygonNum - 1; i >= 0; i += -1) {
      aPolygon = aPolygonList[i]
      if (aPolygon.outLine.type === 'Close') {
        cBound1 = aPolygon.extent
        aValue = aPolygon.lowValue
        aPoint = aPolygon.outLine.pointList[0]
        for (j = i - 1; j >= 0; j += -1) {
          bPolygon = aPolygonList[j]
          cBound2 = bPolygon.extent
          bValue = bPolygon.lowValue
          newPList = []
          Contour.addAll(bPolygon.outLine.pointList, newPList)
          //newPList = new ArrayList<PointD>(bPolygon.outLine.pointList);
          if (pointInPolygonByPList(newPList, aPoint)) {
            if (
              cBound1.xMin > cBound2.xMin &&
              cBound1.yMin > cBound2.yMin &&
              cBound1.xMax < cBound2.xMax &&
              cBound1.yMax < cBound2.yMax
            ) {
              if (aValue < bValue) {
                aPolygon.isHighCenter = false
              } else if (aValue === bValue) {
                if (bPolygon.isHighCenter) {
                  aPolygon.isHighCenter = false
                }
              }
              break
            }
          }
        }
      }
    }

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
        if (aPolygon.isBorder === true) {
          for (j = 0; j < hole1Polygons.length; j++) {
            let bPolygon = hole1Polygons[j]
            if (aPolygon.extent.include(bPolygon.extent)) {
              if (
                pointInPolygonByPList(aPolygon.outLine.pointList, bPolygon.outLine.pointList[0])
              ) {
                aPolygon.addHole(bPolygon)
              }
            }
          }
          newPolygons.push(aPolygon)
        }
      }
      Contour.addAll(holePolygons, newPolygons)
      //newPolygons.addAll(holePolygons);

      return newPolygons
    }
  }

  private static addPolygonHoles_Ring(polygonList: Polygon[]): Polygon[] {
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
              if (
                pointInPolygonByPList(aPolygon.outLine.pointList, bPolygon.outLine.pointList[0])
              ) {
                aPolygon.addHole(bPolygon)
              }
            }
          }
          newPolygons.push(aPolygon)
        }
      }
      Contour.addAll(holePolygons, newPolygons)
      //newPolygons.addAll(holePolygons);
      return newPolygons
    }
  }

  private static addHoles_Ring(polygonList: Polygon[], holeList: PointD[][]) {
    let i, j
    for (i = 0; i < holeList.length; i++) {
      let holePs = holeList[i]
      let aExtent = getExtent(holePs)
      for (j = polygonList.length - 1; j >= 0; j--) {
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

  //</editor-fold>
  // <editor-fold desc="Clipping">
  private static cutPolyline(inPolyline: PolyLine, clipPList: PointD[]): PolyLine[] {
    let newPolylines: PolyLine[] = []
    let aPList: PointD[] = inPolyline.pointList
    let plExtent = getExtent(aPList)
    let cutExtent = getExtent(clipPList)

    if (!isExtentCross(plExtent, cutExtent)) {
      return newPolylines
    }

    let i: number, j: number

    if (!isClockwise(clipPList)) {
      //---- Make cut polygon clockwise
      clipPList.reverse()
    }

    //Judge if all points of the polyline are in the cut polygon
    if (pointInPolygonByPList(clipPList, aPList[0])) {
      let isAllIn = true
      let notInIdx = 0
      for (i = 0; i < aPList.length; i++) {
        if (!pointInPolygonByPList(clipPList, aPList[i])) {
          notInIdx = i
          isAllIn = false
          break
        }
      }
      //if (!isAllIn && inPolyline.type === "Close")   //Put start point outside of the cut polygon
      if (!isAllIn) {
        if (inPolyline.type === 'Close') {
          let bPList: PointD[] = []
          //bPList.AddRange(aPList.getRange(notInIdx, aPList.length - notInIdx));
          //bPList.AddRange(aPList.GetRange(1, notInIdx - 1));
          for (i = notInIdx; i < aPList.length; i++) {
            bPList.push(aPList[i])
          }

          for (i = 1; i < notInIdx; i++) {
            bPList.push(aPList[i])
          }

          bPList.push(bPList[0])
          aPList = []
          Contour.addAll(bPList, aPList)
          //aPList = new ArrayList<PointD>(bPList);
        } else {
          aPList.reverse()
        }
      } //the input polygon is inside the cut polygon
      else {
        newPolylines.push(inPolyline)
        return newPolylines
      }
    }

    //Cutting
    let isInPolygon = pointInPolygonByPList(clipPList, aPList[0])
    let q1: PointD, q2: PointD, p1: PointD, p2: PointD, IPoint: PointD
    let lineA: Line, lineB: Line
    let newPlist: PointD[] = []
    let bLine: PolyLine
    p1 = aPList[0]
    for (i = 1; i < aPList.length; i++) {
      p2 = aPList[i]
      if (pointInPolygonByPList(clipPList, p2)) {
        if (!isInPolygon) {
          IPoint = new PointD()
          lineA = new Line()
          lineA.P1 = p1
          lineA.P2 = p2
          q1 = clipPList[clipPList.length - 1]
          for (j = 0; j < clipPList.length; j++) {
            q2 = clipPList[j]
            lineB = new Line()
            lineB.P1 = q1
            lineB.P2 = q2
            if (Contour.isLineSegmentCross(lineA, lineB)) {
              IPoint = Contour.getCrossPointD(lineA, lineB)
              break
            }
            q1 = q2
          }
          newPlist.push(IPoint)
          //aType = "Border";
        }
        newPlist.push(aPList[i])
        isInPolygon = true
      } else if (isInPolygon) {
        IPoint = new PointD()
        lineA = new Line()
        lineA.P1 = p1
        lineA.P2 = p2
        q1 = clipPList[clipPList.length - 1]
        for (j = 0; j < clipPList.length; j++) {
          q2 = clipPList[j]
          lineB = new Line()
          lineB.P1 = q1
          lineB.P2 = q2
          if (Contour.isLineSegmentCross(lineA, lineB)) {
            IPoint = Contour.getCrossPointD(lineA, lineB)
            break
          }
          q1 = q2
        }
        newPlist.push(IPoint)

        bLine = new PolyLine()
        bLine.value = inPolyline.value
        bLine.type = inPolyline.type
        bLine.pointList = newPlist
        newPolylines.push(bLine)
        isInPolygon = false
        newPlist = []
        //aType = "Border";
      }
      p1 = p2
    }

    if (isInPolygon && newPlist.length > 1) {
      bLine = new PolyLine()
      bLine.value = inPolyline.value
      bLine.type = inPolyline.type
      bLine.pointList = newPlist
      newPolylines.push(bLine)
    }

    return newPolylines
  }

  private static cutPolygon_Hole(inPolygon: Polygon, clipPList: PointD[]): Polygon[] {
    let newPolygons: Polygon[] = []
    let newPolylines: PolyLine[] = []
    let aPList = inPolygon.outLine.pointList
    let plExtent = getExtent(aPList)
    let cutExtent = getExtent(clipPList)

    if (!isExtentCross(plExtent, cutExtent)) {
      return newPolygons
    }

    let i: number, j: number

    if (!isClockwise(clipPList)) {
      //---- Make cut polygon clockwise
      clipPList.reverse()
    }

    //Judge if all points of the polyline are in the cut polygon - outline
    let newLines: PointD[][] = []
    if (pointInPolygonByPList(clipPList, aPList[0])) {
      let isAllIn = true
      let notInIdx = 0
      for (i = 0; i < aPList.length; i++) {
        if (!pointInPolygonByPList(clipPList, aPList[i])) {
          notInIdx = i
          isAllIn = false
          break
        }
      }
      if (!isAllIn) {
        //Put start point outside of the cut polygon
        let bPList: PointD[] = []
        //bPList.AddRange(aPList.GetRange(notInIdx, aPList.Count - notInIdx));
        //bPList.AddRange(aPList.GetRange(1, notInIdx - 1));
        for (i = notInIdx; i < aPList.length; i++) {
          bPList.push(aPList[i])
        }

        for (i = 1; i < notInIdx; i++) {
          bPList.push(aPList[i])
        }

        bPList.push(bPList[0])
        //if (!isClockwise(bPList))
        //    bPList.Reverse();
        newLines.push(bPList)
      } //the input polygon is inside the cut polygon
      else {
        newPolygons.push(inPolygon)
        return newPolygons
      }
    } else {
      newLines.push(aPList)
    }

    //Holes
    let holeLines: PointD[][] = []
    for (let h = 0; h < inPolygon.holeLines.length; h++) {
      let holePList = inPolygon.holeLines[h].pointList
      plExtent = getExtent(holePList)
      if (!isExtentCross(plExtent, cutExtent)) {
        continue
      }

      if (pointInPolygonByPList(clipPList, holePList[0])) {
        let isAllIn = true
        let notInIdx = 0
        for (i = 0; i < holePList.length; i++) {
          if (!pointInPolygonByPList(clipPList, holePList[i])) {
            notInIdx = i
            isAllIn = false
            break
          }
        }
        if (!isAllIn) {
          //Put start point outside of the cut polygon
          let bPList: PointD[] = []
          //bPList.AddRange(holePList.GetRange(notInIdx, holePList.Count - notInIdx));
          //bPList.AddRange(holePList.GetRange(1, notInIdx - 1));
          for (i = notInIdx; i < holePList.length; i++) {
            bPList.push(holePList[i])
          }

          for (i = 1; i < notInIdx; i++) {
            bPList.push(holePList[i])
          }

          bPList.push(bPList[0])
          newLines.push(bPList)
        } //the hole is inside the cut polygon
        else {
          holeLines.push(holePList)
        }
      } else {
        newLines.push(holePList)
      }
    }

    //Prepare border point list
    let borderList: BorderPoint[] = []
    let aBP = new BorderPoint()
    for (let aP of clipPList) {
      aBP = new BorderPoint()
      aBP.point = aP
      aBP.id = -1
      borderList.push(aBP)
    }

    //Cutting
    for (let l = 0; l < newLines.length; l++) {
      aPList = newLines[l]
      let isInPolygon = false
      let q1: PointD, q2: PointD, p1: PointD, p2: PointD, IPoint: PointD
      let lineA: Line, lineB: Line
      let newPlist: PointD[] = []
      let bLine: PolyLine
      p1 = aPList[0]
      let inIdx = -1,
        outIdx = -1
      let newLine = true
      let a1 = 0
      for (i = 1; i < aPList.length; i++) {
        p2 = aPList[i]
        if (pointInPolygonByPList(clipPList, p2)) {
          if (!isInPolygon) {
            lineA = new Line()
            lineA.P1 = p1
            lineA.P2 = p2
            q1 = borderList[borderList.length - 1].point
            IPoint = new PointD()
            for (j = 0; j < borderList.length; j++) {
              q2 = borderList[j].point
              lineB = new Line()
              lineB.P1 = q1
              lineB.P2 = q2
              if (Contour.isLineSegmentCross(lineA, lineB)) {
                IPoint = Contour.getCrossPointD(lineA, lineB)
                aBP = new BorderPoint()
                aBP.id = newPolylines.length
                aBP.point = IPoint
                borderList.splice(j, 0, aBP)
                inIdx = j
                break
              }
              q1 = q2
            }
            newPlist.push(IPoint)
          }
          newPlist.push(aPList[i])
          isInPolygon = true
        } else if (isInPolygon) {
          lineA = new Line()
          lineA.P1 = p1
          lineA.P2 = p2
          q1 = borderList[borderList.length - 1].point
          IPoint = new PointD()
          for (j = 0; j < borderList.length; j++) {
            q2 = borderList[j].point
            lineB = new Line()
            lineB.P1 = q1
            lineB.P2 = q2
            if (Contour.isLineSegmentCross(lineA, lineB)) {
              if (!newLine) {
                if (inIdx - outIdx >= 1 && inIdx - outIdx <= 10) {
                  if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                    borderList.splice(inIdx, 1)
                    borderList.splice(outIdx, 0, aBP)
                    //borderList.remove(inIdx);
                    //borderList.push(outIdx, aBP);
                  }
                } else if (inIdx - outIdx <= -1 && inIdx - outIdx >= -10) {
                  if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                    borderList.splice(inIdx, 1)
                    borderList.splice(outIdx + 1, 0, aBP)
                    //borderList.remove(inIdx);
                    //borderList.push(outIdx + 1, aBP);
                  }
                } else if (inIdx === outIdx) {
                  if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                    borderList.splice(inIdx, 1)
                    borderList.splice(inIdx + 1, 0, aBP)
                    //borderList.remove(inIdx);
                    //borderList.push(inIdx + 1, aBP);
                  }
                }
              }
              IPoint = Contour.getCrossPointD(lineA, lineB)
              aBP = new BorderPoint()
              aBP.id = newPolylines.length
              aBP.point = IPoint
              borderList.splice(j, 0, aBP)
              //borderList.push(j, aBP);
              outIdx = j
              a1 = inIdx

              newLine = false
              break
            }
            q1 = q2
          }
          newPlist.push(IPoint)

          bLine = new PolyLine()
          bLine.value = inPolygon.outLine.value
          bLine.type = inPolygon.outLine.type
          bLine.pointList = newPlist
          newPolylines.push(bLine)

          isInPolygon = false
          newPlist = []
        }
        p1 = p2
      }
    }

    if (newPolylines.length > 0) {
      //Tracing polygons
      newPolygons = Contour.tracingClipPolygons(inPolygon, newPolylines, borderList)
    } else if (pointInPolygonByPList(aPList, clipPList[0])) {
      let aBound: Extent = new Extent()
      let aPolygon: Polygon = new Polygon()
      aPolygon.isBorder = true
      aPolygon.lowValue = inPolygon.lowValue
      aPolygon.highValue = inPolygon.highValue
      aPolygon.area = getExtentAndArea(clipPList, aBound)
      aPolygon.isClockWise = true
      //aPolygon.startPointIdx = lineBorderList.Count - 1;
      aPolygon.extent = aBound
      aPolygon.outLine.pointList = clipPList
      aPolygon.outLine.value = inPolygon.lowValue
      aPolygon.isHighCenter = inPolygon.isHighCenter
      aPolygon.outLine.type = 'Border'
      aPolygon.holeLines = []

      newPolygons.push(aPolygon)
    }

    if (holeLines.length > 0) {
      Contour.addHoles_Ring(newPolygons, holeLines)
    }

    return newPolygons
  }

  private static cutPolygon(inPolygon: Polygon, clipPList: PointD[]): Polygon[] {
    let newPolygons: Polygon[] = []
    let newPolylines: PolyLine[] = []
    let aPList = inPolygon.outLine.pointList
    let plExtent = getExtent(aPList)
    let cutExtent = getExtent(clipPList)

    if (!isExtentCross(plExtent, cutExtent)) {
      return newPolygons
    }

    let i: number, j: number

    if (!isClockwise(clipPList)) {
      //---- Make cut polygon clockwise
      clipPList.reverse()
    }

    //Judge if all points of the polyline are in the cut polygon
    if (pointInPolygonByPList(clipPList, aPList[0])) {
      let isAllIn = true
      let notInIdx = 0
      for (i = 0; i < aPList.length; i++) {
        if (!pointInPolygonByPList(clipPList, aPList[i])) {
          notInIdx = i
          isAllIn = false
          break
        }
      }
      if (!isAllIn) {
        //Put start point outside of the cut polygon
        let bPList: PointD[] = []
        //bPList.AddRange(aPList.GetRange(notInIdx, aPList.Count - notInIdx));
        //bPList.AddRange(aPList.GetRange(1, notInIdx - 1));
        for (i = notInIdx; i < aPList.length; i++) {
          bPList.push(aPList[i])
        }

        for (i = 1; i < notInIdx; i++) {
          bPList.push(aPList[i])
        }

        bPList.push(bPList[0])
        aPList = []
        Contour.addAll(bPList, aPList)
        //aPList = new ArrayList<PointD>(bPList);
      } //the input polygon is inside the cut polygon
      else {
        newPolygons.push(inPolygon)
        return newPolygons
      }
    }

    //Prepare border point list
    let borderList: BorderPoint[] = []
    let aBP = new BorderPoint()
    for (let aP of clipPList) {
      aBP = new BorderPoint()
      aBP.point = aP
      aBP.id = -1
      borderList.push(aBP)
    }

    //Cutting
    let isInPolygon = false
    let q1: PointD, q2: PointD, p1: PointD, p2: PointD, IPoint: PointD
    let lineA: Line, lineB: Line
    let newPlist: PointD[] = []
    let bLine: PolyLine
    p1 = aPList[0]
    let inIdx = -1,
      outIdx = -1
    let a1 = 0
    let isNewLine = true
    for (i = 1; i < aPList.length; i++) {
      p2 = aPList[i]
      if (pointInPolygonByPList(clipPList, p2)) {
        if (!isInPolygon) {
          lineA = new Line()
          lineA.P1 = p1
          lineA.P2 = p2
          q1 = borderList[borderList.length - 1].point
          IPoint = new PointD()
          for (j = 0; j < borderList.length; j++) {
            q2 = borderList[j].point
            lineB = new Line()
            lineB.P1 = q1
            lineB.P2 = q2
            if (Contour.isLineSegmentCross(lineA, lineB)) {
              IPoint = Contour.getCrossPointD(lineA, lineB)
              aBP = new BorderPoint()
              aBP.id = newPolylines.length
              aBP.point = IPoint
              borderList.splice(j, 0, aBP)
              inIdx = j
              break
            }
            q1 = q2
          }
          newPlist.push(IPoint)
        }
        newPlist.push(aPList[i])
        isInPolygon = true
      } else if (isInPolygon) {
        lineA = new Line()
        lineA.P1 = p1
        lineA.P2 = p2
        q1 = borderList[borderList.length - 1].point
        IPoint = new PointD()
        for (j = 0; j < borderList.length; j++) {
          q2 = borderList[j].point
          lineB = new Line()
          lineB.P1 = q1
          lineB.P2 = q2
          if (Contour.isLineSegmentCross(lineA, lineB)) {
            if (!isNewLine) {
              if (inIdx - outIdx >= 1 && inIdx - outIdx <= 10) {
                if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                  borderList.splice(inIdx, 1)
                  borderList.splice(outIdx, 0, aBP)
                }
              } else if (inIdx - outIdx <= -1 && inIdx - outIdx >= -10) {
                if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                  borderList.splice(inIdx, 1)
                  borderList.splice(outIdx + 1, 0, aBP)
                }
              } else if (inIdx === outIdx) {
                if (!Contour.twoPointsInside(a1, outIdx, inIdx, j)) {
                  borderList.splice(inIdx, 1)
                  borderList.splice(inIdx + 1, 0, aBP)
                }
              }
            }
            IPoint = Contour.getCrossPointD(lineA, lineB)
            aBP = new BorderPoint()
            aBP.id = newPolylines.length
            aBP.point = IPoint
            borderList.splice(j, 0, aBP)
            outIdx = j
            a1 = inIdx
            isNewLine = false
            break
          }
          q1 = q2
        }
        newPlist.push(IPoint)

        bLine = new PolyLine()
        bLine.value = inPolygon.outLine.value
        bLine.type = inPolygon.outLine.type
        bLine.pointList = newPlist
        newPolylines.push(bLine)

        isInPolygon = false
        newPlist = []
      }
      p1 = p2
    }

    if (newPolylines.length > 0) {
      //Tracing polygons
      newPolygons = Contour.tracingClipPolygons(inPolygon, newPolylines, borderList)
    } else if (pointInPolygonByPList(aPList, clipPList[0])) {
      let aBound: Extent = new Extent()
      let aPolygon = new Polygon()
      aPolygon.isBorder = true
      aPolygon.lowValue = inPolygon.lowValue
      aPolygon.highValue = inPolygon.highValue
      aPolygon.area = getExtentAndArea(clipPList, aBound)
      aPolygon.isClockWise = true
      //aPolygon.startPointIdx = lineBorderList.Count - 1;
      aPolygon.extent = aBound
      aPolygon.outLine.pointList = clipPList
      aPolygon.outLine.value = inPolygon.lowValue
      aPolygon.isHighCenter = inPolygon.isHighCenter
      aPolygon.outLine.type = 'Border'
      aPolygon.holeLines = []

      newPolygons.push(aPolygon)
    }

    return newPolygons
  }

  private static twoPointsInside(a1: number, a2: number, b1: number, b2: number): boolean {
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

  // </editor-fold>
  // <editor-fold desc="Smoothing">
  private static BSplineScanning(pointList: PointD[], sum: number): PointD[] {
    let t: number
    let i: number
    let X: number, Y: number
    let aPoint: PointD
    let newPList: PointD[] = []

    if (sum < 4) {
      return null
    }

    let isClose = false
    aPoint = pointList[0]
    let bPoint = pointList[sum - 1]
    if (aPoint.x === bPoint.x && aPoint.y === bPoint.y) {
      pointList.splice(0, 1)
      //pointList.remove(0);
      pointList.push(pointList[0])
      pointList.push(pointList[1])
      pointList.push(pointList[2])
      pointList.push(pointList[3])
      pointList.push(pointList[4])
      pointList.push(pointList[5])
      pointList.push(pointList[6])
      //pointList.push(pointList[7]);
      //pointList.push(pointList[8]);
      isClose = true
    }

    sum = pointList.length
    for (i = 0; i < sum - 3; i++) {
      for (t = 0; t <= 1; t += 0.05) {
        let xy = Contour.BSpline(pointList, t, i)
        X = xy[0]
        Y = xy[1]
        if (isClose) {
          if (i > 3) {
            aPoint = new PointD()
            aPoint.x = X
            aPoint.y = Y
            newPList.push(aPoint)
          }
        } else {
          aPoint = new PointD()
          aPoint.x = X
          aPoint.y = Y
          newPList.push(aPoint)
        }
      }
    }

    if (isClose) {
      newPList.push(newPList[0])
    } else {
      newPList.splice(0, 0, pointList[0])
      //newPList.push(0, pointList[0]);
      newPList.push(pointList[pointList.length - 1])
    }

    return newPList
  }

  private static BSpline(pointList: PointD[], t: number, i: number): number[] {
    let f: number[] = []
    Contour.fb(t, f)
    let j: number
    let X = 0
    let Y = 0
    let aPoint: PointD
    for (j = 0; j < 4; j++) {
      aPoint = pointList[i + j]
      X = X + f[j] * aPoint.x
      Y = Y + f[j] * aPoint.y
    }

    let xy: number[] = []
    xy[0] = X
    xy[1] = Y

    return xy
  }

  private static f0(t: number): number {
    return (1.0 / 6) * (-t + 1) * (-t + 1) * (-t + 1)
  }

  private static f1(t: number): number {
    return (1.0 / 6) * (3 * t * t * t - 6 * t * t + 4)
  }

  private static f2(t: number): number {
    return (1.0 / 6) * (-3 * t * t * t + 3 * t * t + 3 * t + 1)
  }

  private static f3(t: number): number {
    return (1.0 / 6) * t * t * t
  }

  private static fb(t: number, fs: number[]) {
    fs[0] = Contour.f0(t)
    fs[1] = Contour.f1(t)
    fs[2] = Contour.f2(t)
    fs[3] = Contour.f3(t)
  }

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
  public static tracingStreamline(
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
            let isInDomain = Contour.tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, true)
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
                      dis = Contour.distance_point2line(pointStart.point, pointEnd.point, aPoint)
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
            let isInDomain = Contour.tracingStreamlinePoint(aPoint, Dx, Dy, X, Y, iijj, false)
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
                      dis = Contour.distance_point2line(pointStart.point, pointEnd.point, aPoint)
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

  private static tracingStreamlinePoint(
    aPoint: PointD,
    Dx: number[][],
    Dy: number[][],
    X: number[],
    Y: number[],
    iijj: number[],
    isForward: boolean
  ): boolean {
    let a: number, b: number, c: number, d: number, val1: number, val2: number
    let dx: number, dy: number
    let xNum = X.length
    let yNum = Y.length
    let deltX = X[1] - X[0]
    let deltY = Y[1] - Y[0]
    let ii = iijj[0]
    let jj = iijj[1]

    //Interpolation the U/V displacement components to the point
    a = Dx[ii][jj]
    b = Dx[ii][jj + 1]
    c = Dx[ii + 1][jj]
    d = Dx[ii + 1][jj + 1]
    val1 = a + (c - a) * ((aPoint.y - Y[ii]) / deltY)
    val2 = b + (d - b) * ((aPoint.y - Y[ii]) / deltY)
    dx = val1 + (val2 - val1) * ((aPoint.x - X[jj]) / deltX)
    a = Dy[ii][jj]
    b = Dy[ii][jj + 1]
    c = Dy[ii + 1][jj]
    d = Dy[ii + 1][jj + 1]
    val1 = a + (c - a) * ((aPoint.y - Y[ii]) / deltY)
    val2 = b + (d - b) * ((aPoint.y - Y[ii]) / deltY)
    dy = val1 + (val2 - val1) * ((aPoint.x - X[jj]) / deltX)

    //Tracing forward by U/V displacement components
    if (isForward) {
      aPoint.x += dx
      aPoint.y += dy
    } else {
      aPoint.x -= dx
      aPoint.y -= dy
    }

    //Find the grid box that the point is located
    if (
      !(aPoint.x >= X[jj] && aPoint.x <= X[jj + 1] && aPoint.y >= Y[ii] && aPoint.y <= Y[ii + 1])
    ) {
      if (
        aPoint.x < X[0] ||
        aPoint.x > X[X.length - 1] ||
        aPoint.y < Y[0] ||
        aPoint.y > Y[Y.length - 1]
      ) {
        return false
      }

      //Get the grid box of the point located
      for (let ti = ii - 2; ti < ii + 3; ti++) {
        if (ti >= 0 && ti < yNum) {
          if (aPoint.y >= Y[ti] && aPoint.y <= Y[ti + 1]) {
            ii = ti
            for (let tj = jj - 2; tj < jj + 3; tj++) {
              if (tj >= 0 && tj < xNum) {
                if (aPoint.x >= X[tj] && aPoint.x <= X[tj + 1]) {
                  jj = tj
                  break
                }
              }
            }
            break
          }
        }
      }
    }

    iijj[0] = ii
    iijj[1] = jj
    return true
  }

  private static distance_point2line(pt1: PointD, pt2: PointD, point: PointD): number {
    let k = (pt2.y - pt1.y) / (pt2.x - pt1.x)
    let x = (k * k * pt1.x + k * (point.y - pt1.y) + point.x) / (k * k + 1)
    let y = k * (x - pt1.x) + pt1.y
    let dis = Math.sqrt((point.y - y) * (point.y - y) + (point.x - x) * (point.x - x))
    return dis
  }

  private static isLineSegmentCross(lineA: Line, lineB: Line): boolean {
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

  /**
   * Get cross point of two line segments
   *
   * @param aP1 point 1 of line a
   * @param aP2 point 2 of line a
   * @param bP1 point 1 of line b
   * @param bP2 point 2 of line b
   * @return cross point
   */
  public static getCrossPointF(aP1: PointD, aP2: PointD, bP1: PointD, bP2: PointD): PointD {
    let IPoint = new PointD(0, 0)
    let p1: PointD, p2: PointD, q1: PointD, q2: PointD
    let tempLeft: number, tempRight: number

    let XP1 = (bP1.x - aP1.x) * (aP2.y - aP1.y) - (aP2.x - aP1.x) * (bP1.y - aP1.y)
    let XP2 = (bP2.x - aP1.x) * (aP2.y - aP1.y) - (aP2.x - aP1.x) * (bP2.y - aP1.y)
    if (XP1 === 0) {
      IPoint = bP1
    } else if (XP2 === 0) {
      IPoint = bP2
    } else {
      p1 = aP1
      p2 = aP2
      q1 = bP1
      q2 = bP2

      tempLeft = (q2.x - q1.x) * (p1.y - p2.y) - (p2.x - p1.x) * (q1.y - q2.y)
      tempRight =
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

  private static getCrossPointD(lineA: Line, lineB: Line): PointD {
    let IPoint = new PointD()
    let p1: PointD, p2: PointD, q1: PointD, q2: PointD
    let tempLeft: number, tempRight: number

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
      p1 = lineA.P1
      p2 = lineA.P2
      q1 = lineB.P1
      q2 = lineB.P2

      tempLeft = (q2.x - q1.x) * (p1.y - p2.y) - (p2.x - p1.x) * (q1.y - q2.y)
      tempRight =
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

  private static insertPoint2Border(
    bPList: BorderPoint[],
    aBorderList: BorderPoint[]
  ): BorderPoint[] {
    let aBPoint: BorderPoint, bP: BorderPoint
    let i: number, j: number
    let p1: PointD, p2: PointD, p3: PointD
    let BorderList: BorderPoint[] = []
    Contour.addAll(aBorderList, BorderList)
    //new ArrayList<BorderPoint>(aBorderList);

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

  private static insertPoint2RectangleBorder(LineList: PolyLine[], aBound: Extent): BorderPoint[] {
    let bPoint: BorderPoint, bP: BorderPoint
    let aLine: PolyLine
    let aPoint: PointD
    let i: number, j: number, k: number
    let LBPList: BorderPoint[] = [],
      TBPList: BorderPoint[] = []
    let RBPList: BorderPoint[] = [],
      BBPList: BorderPoint[] = []
    let BorderList: BorderPoint[] = []
    let aPointList: PointD[]
    let IsInserted: boolean

    //---- Get four border point list
    for (i = 0; i < LineList.length; i++) {
      aLine = LineList[i]
      if (!('Close' === aLine.type)) {
        aPointList = []
        Contour.addAll(aLine.pointList, aPointList)
        //aPointList = new ArrayList<PointD>(aLine.pointList);
        bP = new BorderPoint()
        bP.id = i
        for (k = 0; k <= 1; k++) {
          if (k === 0) {
            aPoint = aPointList[0]
          } else {
            aPoint = aPointList[aPointList.length - 1]
          }

          bP.point = aPoint
          IsInserted = false
          if (aPoint.x === aBound.xMin) {
            for (j = 0; j < LBPList.length; j++) {
              bPoint = LBPList[j]
              if (aPoint.y < bPoint.point.y) {
                LBPList.splice(j, 0, bP)
                IsInserted = true
                break
              }
            }
            if (!IsInserted) {
              LBPList.push(bP)
            }
          } else if (aPoint.x === aBound.xMax) {
            for (j = 0; j < RBPList.length; j++) {
              bPoint = RBPList[j]
              if (aPoint.y > bPoint.point.y) {
                RBPList.splice(j, 0, bP)
                IsInserted = true
                break
              }
            }
            if (!IsInserted) {
              RBPList.push(bP)
            }
          } else if (aPoint.y === aBound.yMin) {
            for (j = 0; j < BBPList.length; j++) {
              bPoint = BBPList[j]
              if (aPoint.x > bPoint.point.x) {
                BBPList.splice(j, 0, bP)
                IsInserted = true
                break
              }
            }
            if (!IsInserted) {
              BBPList.push(bP)
            }
          } else if (aPoint.y === aBound.yMax) {
            for (j = 0; j < TBPList.length; j++) {
              bPoint = TBPList[j]
              if (aPoint.x < bPoint.point.x) {
                TBPList.splice(j, 0, bP)
                IsInserted = true
                break
              }
            }
            if (!IsInserted) {
              TBPList.push(bP)
            }
          }
        }
      }
    }

    //---- Get border list
    bP = new BorderPoint()
    bP.id = -1

    aPoint = new PointD()
    aPoint.x = aBound.xMin
    aPoint.y = aBound.yMin
    bP.point = aPoint
    BorderList.push(bP)
    Contour.addAll(LBPList, BorderList)
    //BorderList.addAll(LBPList);

    bP = new BorderPoint()
    bP.id = -1
    aPoint = new PointD()
    aPoint.x = aBound.xMin
    aPoint.y = aBound.yMax
    bP.point = aPoint
    BorderList.push(bP)
    Contour.addAll(TBPList, BorderList)
    //BorderList.addAll(TBPList);

    bP = new BorderPoint()
    bP.id = -1
    aPoint = new PointD()
    aPoint.x = aBound.xMax
    aPoint.y = aBound.yMax
    bP.point = aPoint
    BorderList.push(bP)
    Contour.addAll(RBPList, BorderList)
    //BorderList.addAll(RBPList);

    bP = new BorderPoint()
    bP.id = -1
    aPoint = new PointD()
    aPoint.x = aBound.xMax
    aPoint.y = aBound.yMin
    bP.point = aPoint
    BorderList.push(bP)
    Contour.addAll(BBPList, BorderList)
    //BorderList.addAll(BBPList);

    BorderList.push(BorderList[0])

    return BorderList
  }

  private static insertEndPoint2Border(
    EPList: EndPoint[],
    aBorderList: BorderPoint[]
  ): BorderPoint[] {
    let aBPoint: BorderPoint, bP: BorderPoint
    let i: number, j: number, k: number
    let p1: PointD, p2: PointD
    let aEPList: EndPoint[]
    let temEPList: EndPoint[] = []
    let dList: any[] = []
    let aEP: EndPoint
    let dist: number
    let IsInsert: boolean
    let BorderList: BorderPoint[] = []
    aEPList = []
    Contour.addAll(EPList, aEPList)
    //aEPList = new ArrayList<EndPoint>(EPList);

    aBPoint = aBorderList[0]
    p1 = aBPoint.point
    BorderList.push(aBPoint)
    for (i = 1; i < aBorderList.length; i++) {
      aBPoint = aBorderList[i]
      p2 = aBPoint.point
      temEPList = []
      for (j = 0; j < aEPList.length; j++) {
        if (j === aEPList.length) {
          break
        }

        aEP = aEPList[j]
        if (Math.abs(aEP.sPoint.x - p1.x) < 0.000001 && Math.abs(aEP.sPoint.y - p1.y) < 0.000001) {
          temEPList.push(aEP)
          aEPList.splice(j, 1)
          //aEPList.remove(j);
          j -= 1
        }
      }
      if (temEPList.length > 0) {
        dList = []
        if (temEPList.length > 1) {
          for (j = 0; j < temEPList.length; j++) {
            aEP = temEPList[j]
            dist = Math.pow(aEP.point.x - p1.x, 2) + Math.pow(aEP.point.y - p1.y, 2)
            if (j === 0) {
              dList.push([dist, j])
            } else {
              IsInsert = false
              for (k = 0; k < dList.length; k++) {
                if (dist < parseFloat(dList[k][0])) {
                  dList.splice(k, 0, [dist, j])
                  IsInsert = true
                  break
                }
              }
              if (!IsInsert) {
                dList.push([dist, j])
              }
            }
          }
          for (j = 0; j < dList.length; j++) {
            aEP = temEPList[parseInt(dList[j][1])]
            bP = new BorderPoint()
            bP.id = aEP.index
            bP.point = aEP.point
            BorderList.push(bP)
          }
        } else {
          aEP = temEPList[0]
          bP = new BorderPoint()
          bP.id = aEP.index
          bP.point = aEP.point
          BorderList.push(bP)
        }
      }

      BorderList.push(aBPoint)

      p1 = p2
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
      Contour.addAll(tempBPList1, newBPList)
      //newBPList.addAll(tempBPList1);
    }

    return newBPList
  }
}
