import Extent from './Extent'
import PointD from './PointD'
import PolyLine from './PolyLine'

export default class Polygon {
  public isBorder: boolean
  public isInnerBorder = false
  public lowValue: number
  public highValue: number
  public isClockWise: boolean
  public startPointIdx: number
  public isHighCenter: boolean
  public extent: Extent = new Extent()
  public area: number
  public outLine: PolyLine = new PolyLine()
  public holeLines: PolyLine[] = []
  public holeIndex: number

  /**
   * clone
   */
  public clone(): Polygon {
    let polygon = new Polygon()
    polygon.isBorder = this.isBorder
    polygon.lowValue = this.lowValue
    polygon.highValue = this.highValue
    polygon.isClockWise = this.isClockWise
    polygon.startPointIdx = this.startPointIdx
    polygon.isHighCenter = this.isHighCenter
    polygon.extent = this.extent
    polygon.area = this.area
    polygon.outLine = this.outLine
    polygon.holeLines = this.holeLines
    polygon.holeIndex = this.holeIndex
    return polygon
  }

  /**
   * hasHoles
   */
  public hasHoles() {
    return this.holeLines.length > 0
  }

  /**
   * addHole
   */
  public addHole(polygon: Polygon | PointD[]) {
    if (polygon instanceof Polygon) {
      this.holeLines.push(polygon.outLine)
    } else {
      const pList = polygon
      const aLine = new PolyLine()
      aLine.pointList = pList
      this.holeLines.push(aLine)
    }
  }
}
