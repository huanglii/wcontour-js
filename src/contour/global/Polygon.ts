import { isClockwise } from '../utils/uti'
import Extent from './Extent'
import PointD from './PointD'
import PolyLine from './PolyLine'

/**
 * Polygon class - a polygon with outline, holes and extent
 */
export default class Polygon {
  public isBorder: boolean = false
  public isInnerBorder: boolean = false
  public lowValue: number = 0
  public highValue: number = 0
  public isClockWise: boolean = false
  public startPointIdx: number = 0
  public isHighCenter: boolean = false
  public extent: Extent = new Extent()
  public area: number = 0
  public outLine: PolyLine = new PolyLine()
  public holeLines: PolyLine[] = []
  public holeIndex: number = 0

  /**
   * Clone this polygon
   * @returns New polygon
   */
  public clone(): Polygon {
    const polygon = new Polygon()
    polygon.isBorder = this.isBorder
    polygon.isInnerBorder = this.isInnerBorder
    polygon.lowValue = this.lowValue
    polygon.highValue = this.highValue
    polygon.isClockWise = this.isClockWise
    polygon.startPointIdx = this.startPointIdx
    polygon.isHighCenter = this.isHighCenter
    polygon.extent = this.extent.clone()
    polygon.area = this.area
    polygon.outLine = this.outLine.clone()
    polygon.holeLines = this.holeLines.map((h) => h.clone())
    polygon.holeIndex = this.holeIndex
    return polygon
  }

  /**
   * Whether this polygon has holes
   * @returns Has holes or not
   */
  public hasHoles(): boolean {
    return this.holeLines.length > 0
  }

  /**
   * Add a hole from a Polygon or a point array
   * @param polygon Polygon or point array
   */
  public addHole(polygon: Polygon | PointD[]): void {
    if (polygon instanceof Polygon) {
      this.holeLines.push(polygon.outLine)
      return
    }
    const pList = isClockwise(polygon) ? polygon.reverse() : polygon
    const aLine = new PolyLine()
    aLine.pointList = pList
    this.holeLines.push(aLine)
  }
}
