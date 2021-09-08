import PointD from '../global/PointD'
import PolyLine from '../global/PolyLine'
import { BSplineScanning } from './spline'

/**
 * Smooth points
 *
 * @param pointList point list
 * @return smoothed point list
 */
export function smoothPoints(pointList: PointD[]): PointD[] {
  return BSplineScanning(pointList, pointList.length)
}

/**
 * Smooth polylines
 *
 * @param aLineList polyline list
 * @return smoothed polyline list
 */
export function smoothLines(aLineList: PolyLine[]): PolyLine[] {
  let newLineList: PolyLine[] = []
  for (let i = 0; i < aLineList.length; i++) {
    const aline = aLineList[i]
    const newPList = aline.pointList
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
    const smoothedPList = BSplineScanning(newPList, newPList.length)
    aline.pointList = smoothedPList
    newLineList.push(aline)
  }
  return newLineList
}
