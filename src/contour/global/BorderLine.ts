import Extent from './Extent'
import IJPoint from './IJPoint'
import type PointD from './PointD'

/**
 * BorderLine class - a border line with points and grid indices
 */
export default class BorderLine {
  area: number = 0
  extent: Extent = new Extent()
  isOutLine: boolean = false
  isClockwise: boolean = false
  pointList: PointD[] = []
  ijPointList: IJPoint[] = []

  /**
   * Clone this border line
   * @returns New border line
   */
  clone(): BorderLine {
    const bl = new BorderLine()
    bl.area = this.area
    bl.extent = this.extent.clone()
    bl.isOutLine = this.isOutLine
    bl.isClockwise = this.isClockwise
    bl.pointList = this.pointList.map((p) => p.clone())
    bl.ijPointList = this.ijPointList.map((ij) => new IJPoint(ij.i, ij.j))
    return bl
  }
}
