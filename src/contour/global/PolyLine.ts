import type PointD from './PointD'

export type PolyLineType = 'Border' | 'Close' | 'Bottom' | 'Left' | 'Top' | 'Right' | 'Error'

/**
 * PolyLine class - a polyline with value and type
 */
export default class PolyLine {
  value: number = 0
  type: PolyLineType = 'Error'
  borderIdx: number = 0
  pointList: PointD[] = []

  /**
   * Clone this polyline
   * @returns New polyline
   */
  clone(): PolyLine {
    const pl = new PolyLine()
    pl.value = this.value
    pl.type = this.type
    pl.borderIdx = this.borderIdx
    pl.pointList = this.pointList.map((p) => p.clone())
    return pl
  }
}
