export default class Extent {
  constructor(public xMin?: number, public xMax?: number, public yMin?: number, public yMax?: number) {}

  /**
   * Judge if this extent include another extent
   * @param e The extent
   * @returns Is included or not
   */
  public include(e: Extent): boolean {
    return this.xMin <= e.xMin && this.xMax >= e.xMax && this.yMin <= e.yMin && this.yMax >= e.yMax
  }
}
