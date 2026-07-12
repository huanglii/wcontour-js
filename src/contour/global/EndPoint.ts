import PointD from './PointD'

/**
 * EndPoint class - an end point with start point and index
 */
export default class EndPoint {
  sPoint: PointD = new PointD()
  point: PointD = new PointD()
  index: number = 0
  borderIdx: number = 0
}
