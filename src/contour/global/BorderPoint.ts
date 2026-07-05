import PointD from './PointD'

/**
 * BorderPoint class - a point on the border with value
 */
export default class BorderPoint {
  public id: number = 0
  public borderIdx: number = 0
  public bInnerIdx: number = 0
  public point: PointD = new PointD()
  public value: number = 0

  /**
   * Clone this border point
   * @returns New border point
   */
  public clone(): BorderPoint {
    const borderPoint = new BorderPoint()
    borderPoint.id = this.id
    borderPoint.borderIdx = this.borderIdx
    borderPoint.bInnerIdx = this.bInnerIdx
    borderPoint.point = this.point.clone()
    borderPoint.value = this.value
    return borderPoint
  }
}
