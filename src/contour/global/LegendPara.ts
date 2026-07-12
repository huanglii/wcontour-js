import PointD from './PointD'

/**
 * LegendPara class - legend parameters
 */
export default class LegendPara {
  isVertical: number = 0
  startPoint: PointD = new PointD()
  length: number = 0
  width: number = 0
  contourValues: number[] = []
  isTriangle: boolean = false
}
