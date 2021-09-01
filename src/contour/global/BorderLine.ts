import Extent from './Extent'
import IJPoint from './IJPoint'
import PointD from './PointD'

export default class BorderLine {
  public area: number
  public extent: Extent = new Extent()
  public isOutLine: boolean
  public isClockwise: boolean
  public pointList: PointD[] = []
  public ijPointList: IJPoint[] = []
}
