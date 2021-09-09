import PointD from './PointD'
import { PolyLineType } from '../types'

export default class PolyLine {
  public value: number
  public type: PolyLineType
  public borderIdx: number
  public pointList: PointD[] = []
}
