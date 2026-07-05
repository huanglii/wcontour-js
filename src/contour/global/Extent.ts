/**
 * Extent class - a bounding box defined by x/y min and max
 */
export default class Extent {
  public xMin?: number
  public xMax?: number
  public yMin?: number
  public yMax?: number

  constructor(xMin?: number, xMax?: number, yMin?: number, yMax?: number) {
    this.xMin = xMin
    this.xMax = xMax
    this.yMin = yMin
    this.yMax = yMax
  }

  /**
   * Clone this extent
   * @returns New extent
   */
  public clone(): Extent {
    return new Extent(this.xMin, this.xMax, this.yMin, this.yMax)
  }

  /**
   * Judge if this extent includes another extent
   * @param e The extent
   * @returns Is included or not
   */
  public include(e: Extent): boolean {
    return this.xMin <= e.xMin && this.xMax >= e.xMax && this.yMin <= e.yMin && this.yMax >= e.yMax
  }
}
