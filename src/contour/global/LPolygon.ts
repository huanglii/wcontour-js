import type PointD from './PointD'

/**
 * LPolygon class - a polygon with value and point list
 */
export default class LPolygon {
  value: number = 0
  isFirst: boolean = false
  pointList: PointD[] = []
}
