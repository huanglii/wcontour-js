import PointD from './PointD'

/**
 * BorderPoint class
 */
export default class BorderPoint {
  public id: number
  public borderIdx: number
  public bInnerIdx: number
  public point: PointD = new PointD()
  public value: number

  /**
   * clone
   */
  public clone() {
    let borderPoint = new BorderPoint()
    borderPoint.id = this.id
    borderPoint.borderIdx = this.borderIdx
    borderPoint.bInnerIdx = this.bInnerIdx
    borderPoint.point = this.point
    borderPoint.value = this.value
    return borderPoint
  }
}
