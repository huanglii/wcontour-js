import PointD from './PointD'

/**
 * LPolygon class - a polygon with value and point list
 */
export default class LPolygon {
  public value: number = 0
  public isFirst: boolean = false
  public pointList: PointD[] = []
}
