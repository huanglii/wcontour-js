import PointD from './PointD'

export default class Point3D extends PointD {
  public z: number
  public m: number

  constructor(x: number, y: number, z: number, m?: number) {
    super(x, y)
    this.z = z
    this.m = m
  }

  /**
   * Calculate distance to a point
   * @param p The point
   * @return distance
   */
  public distance(p: Point3D): number {
    return Math.sqrt(
      (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y) + (this.z - p.z) * (this.z - p.z)
    )
  }

  /**
   * Dot product to a point
   * @param p The point
   * @return Dot product result
   */
  public dot(p: Point3D): number {
    return this.x * p.x + this.y * p.y + this.z * p.z
  }

  /**
   * Add to a point
   * @param p The point
   * @return Add result
   */
  public add(p: Point3D): Point3D {
    return new Point3D(this.x + p.x, this.y + p.y, this.z + p.z)
  }

  /**
   * Subtract to a point
   * @param p The point
   * @return Subtract result
   */
  public sub(p: Point3D): Point3D {
    return new Point3D(this.x - p.x, this.y - p.y, this.z - p.z)
  }

  /**
   * Multiply
   * @param v The value
   * @return Multiply result
   */
  public mul(v: number): Point3D {
    return new Point3D(this.x * v, this.y * v, this.z * v)
  }

  /**
   * Divide
   * @param v The value
   * @return Divide result
   */
  public div(v: number): Point3D {
    return new Point3D(this.x / v, this.y / v, this.z / v)
  }

  public clone(): Point3D {
    return new Point3D(this.x, this.y, this.z, this.m)
  }
}
