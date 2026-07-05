/**
 * PointD class - a 2D point with x and y coordinates
 */
export default class PointD {
  public x: number
  public y: number

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  /**
   * Clone this point
   * @returns New point
   */
  public clone(): PointD {
    return new PointD(this.x, this.y)
  }
}
