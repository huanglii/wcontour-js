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
 * Smooth polylines 返回一个已平滑的 PolyLine 的新数组。
 * pointList.length <= 1 的线会被过滤掉（无法平滑）。
 *
 * @param aLineList polyline list
 * @return smoothed polyline list (new array, cloned lines)
 */
export function smoothLines(aLineList: PolyLine[]): PolyLine[] {
  const newLineList: PolyLine[] = []
  for (const aline of aLineList) {
    if (aline.pointList.length <= 1) {
      continue
    }

    const cloned = aline.clone()
    const newPList = cloned.pointList

    if (newPList.length === 2) {
      const [aP, cP] = newPList
      newPList.splice(1, 0, new PointD((cP.x - aP.x) / 4 + aP.x, (cP.y - aP.y) / 4 + aP.y))
      newPList.splice(2, 0, new PointD(((cP.x - aP.x) / 4) * 3 + aP.x, ((cP.y - aP.y) / 4) * 3 + aP.y))
    }
    if (newPList.length === 3) {
      const [aP, cP] = newPList
      newPList.splice(1, 0, new PointD((cP.x - aP.x) / 2 + aP.x, (cP.y - aP.y) / 2 + aP.y))
    }
    cloned.pointList = BSplineScanning(newPList, newPList.length)
    newLineList.push(cloned)
  }
  return newLineList
}
