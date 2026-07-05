import PointD from './PointD'

type PolyLineType = 'Border' | 'Close' | 'Bottom' | 'Left' | 'Top' | 'Right' | 'Error'

/**
 * PolyLine class - a polyline with value and type
 */
export default class PolyLine {
  public value: number = 0
  public type: PolyLineType
  public borderIdx: number = 0
  public pointList: PointD[] = []

  /**
   * Clone this polyline
   * @returns New polyline
   */
  public clone(): PolyLine {
    const pl = new PolyLine()
    pl.value = this.value
    pl.type = this.type
    pl.borderIdx = this.borderIdx
    pl.pointList = this.pointList.map((p) => p.clone())
    return pl
  }
}
