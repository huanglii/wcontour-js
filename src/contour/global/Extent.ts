/**
 * Extent class - a bounding box defined by x/y min and max
 */
export default class Extent {
  constructor(
    public xMin: number = 0,
    public xMax: number = 0,
    public yMin: number = 0,
    public yMax: number = 0,
  ) {}

  /**
   * Clone this extent
   * @returns New extent
   */
  clone(): Extent {
    return new Extent(this.xMin, this.xMax, this.yMin, this.yMax)
  }

  /**
   * Judge if this extent includes another extent
   * @param e The extent
   * @returns Is included or not
   */
  include(e: Extent): boolean {
    return this.xMin <= e.xMin && this.xMax >= e.xMax && this.yMin <= e.yMin && this.yMax >= e.yMax
  }
}
