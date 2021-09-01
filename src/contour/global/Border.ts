import BorderLine from './BorderLine'

/**
 * Border class - contour line border
 */
export default class Border {
  public lineList: BorderLine[] = []
  /**
   * Get line number
   * @returns
   */
  public getLineNum(): number {
    return this.lineList.length
  }
}
