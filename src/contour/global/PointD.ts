export default class PointD {
  public x: number
  public y: number

  constructor(x = 0, y = 0) {
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
