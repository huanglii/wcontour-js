import PointD from './PointD'

/**
 * EndPoint class - an end point with start point and index
 */
export default class EndPoint {
  public sPoint: PointD = new PointD()
  public point: PointD = new PointD()
  public index: number = 0
  public borderIdx: number = 0
}
