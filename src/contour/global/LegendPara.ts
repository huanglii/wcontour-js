import PointD from './PointD'

/**
 * LegendPara class - legend parameters
 */
export default class LegendPara {
  public isVertical: number = 0
  public startPoint: PointD = new PointD()
  public length: number = 0
  public width: number = 0
  public contourValues: number[] = []
  public isTriangle: boolean = false
}
