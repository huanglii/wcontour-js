import Border from '../global/Border'
import BorderPoint from '../global/BorderPoint'
import Extent from '../global/Extent'
import PointD from '../global/PointD'
import Polygon from '../global/Polygon'
import PolyLine from '../global/PolyLine'
import {
  doubleEquals,
  getExtentAndArea,
  isClockwise,
  pointInPolygon,
  pointInPolygonByPList,
} from './uti'

export function canTraceBorder(
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

export function canTraceIsoline_UndefData(
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

export function tracingPolygons_Ring(
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
  aLineList.push(...LineList)

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
          newPList.push(...aLine.pointList)
          aPoint = newPList[0]
          //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
          //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Not start point
          //---- Not start point
          if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
            newPList.reverse()
          }
          aPList.push(...newPList)
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
          newPList.push(...aLine.pointList)
          aPoint = newPList[0]
          //If Not (Math.Abs(bP.point.x - aPoint.x) < 0.000001 And _
          //  Math.Abs(bP.point.y - aPoint.y) < 0.000001) Then    '---- Start point
          //---- Start point
          if (!(bP.point.x === aPoint.x && bP.point.y === aPoint.y)) {
            newPList.reverse()
          }
          aPList.push(...newPList)
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
    aLine.pointList.push(...aBorder.lineList[0].pointList)

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
  aPolygonList.push(...cPolygonlist)

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
        newPList.push(...bPolygon.outLine.pointList)
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

export function tracingClipPolygons(
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
  aLineList.push(...LineList)

  //---- Tracing border polygon
  let aPList: PointD[]
  let newPList: PointD[] = []
  let bP: BorderPoint
  let timesArray: number[] = []
  timesArray.length = borderList.length - 1
  for (let i = 0; i < timesArray.length; i++) {
    timesArray[i] = 0
  }

  let pIdx, pNum
  let lineBorderList: BorderPoint[] = []

  pNum = borderList.length - 1
  let bPoint: PointD, b1Point: PointD
  for (let i = 0; i < pNum; i++) {
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
      if (pointInPolygon(inPolygon, bPoint)) {
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
            newPList.push(...aLine.pointList)
            aPoint = newPList[0]

            if (!(doubleEquals(bP.point.x, aPoint.x) && doubleEquals(bP.point.y, aPoint.y))) {
              //---- Start point
              newPList.reverse()
            }
            aPList.push(...newPList)
            for (let j = 0; j < borderList.length - 1; j++) {
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
          if (pIdx + o < borderList.length - 1 && borderList[pIdx + o].id > -1) {
            aIdx = pIdx + o - 1
            break
          }
        }
        bPoint = borderList[aIdx].point.clone()
      } else {
        bPoint.x = (bPoint.x + b1Point.x) / 2
        bPoint.y = (bPoint.y + b1Point.y) / 2
      }
      if (pointInPolygon(inPolygon, bPoint)) {
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
            newPList.push(...aLine.pointList)
            aPoint = newPList[0]

            if (!(doubleEquals(bP.point.x, aPoint.x) && doubleEquals(bP.point.y, aPoint.y))) {
              //---- Start point
              newPList.reverse()
            }
            aPList.push(...newPList)
            for (let j = 0; j < borderList.length - 1; j++) {
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

export function tracingStreamlinePoint(
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
  if (!(aPoint.x >= X[jj] && aPoint.x <= X[jj + 1] && aPoint.y >= Y[ii] && aPoint.y <= Y[ii + 1])) {
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
