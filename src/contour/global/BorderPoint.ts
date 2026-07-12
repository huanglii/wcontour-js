import PointD from './PointD'

/**
 * BorderPoint class - a point on the border with value
 */
export default class BorderPoint {
  id: number = 0
  borderIdx: number = 0
  bInnerIdx: number = 0
  point: PointD = new PointD()
  value: number = 0

  /**
   * Clone this border point
   * @returns New border point
   */
  clone(): BorderPoint {
    const borderPoint = new BorderPoint()
    borderPoint.id = this.id
    borderPoint.borderIdx = this.borderIdx
    borderPoint.bInnerIdx = this.bInnerIdx
    borderPoint.point = this.point.clone()
    borderPoint.value = this.value
    return borderPoint
  }
}
