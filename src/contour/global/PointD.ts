/**
 * PointD class - a 2D point with x and y coordinates
 */
export default class PointD {
  constructor(public x: number = 0, public y: number = 0) {}

  /**
   * Clone this point
   * @returns New point
   */
  clone(): PointD {
    return new PointD(this.x, this.y)
  }
}
