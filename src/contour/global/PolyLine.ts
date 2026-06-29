import PointD from './PointD'
import { PolyLineType } from '../types'

export default class PolyLine {
  public value: number
  public type: PolyLineType
  public borderIdx: number
  public pointList: PointD[] = []

  public clone(): PolyLine {
    const pl = new PolyLine()
    pl.value = this.value
    pl.type = this.type
    pl.borderIdx = this.borderIdx
    pl.pointList = this.pointList.map((p) => p.clone())
    return pl
  }
}
