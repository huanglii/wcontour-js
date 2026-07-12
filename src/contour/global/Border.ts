import type BorderLine from './BorderLine'

/**
 * Border class - contour line border
 */
export default class Border {
  lineList: BorderLine[] = []

  /**
   * Get line number
   * @returns Line number
   */
  getLineNum(): number {
    return this.lineList.length
  }
}
