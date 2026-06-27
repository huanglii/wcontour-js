import { describe, it, expect } from 'vitest'
import PointD from '../src/contour/global/PointD'
import Extent from '../src/contour/global/Extent'
import Polygon from '../src/contour/global/Polygon'
import PolyLine from '../src/contour/global/PolyLine'
import BorderPoint from '../src/contour/global/BorderPoint'
import Border from '../src/contour/global/Border'
import BorderLine from '../src/contour/global/BorderLine'
import IJPoint from '../src/contour/global/IJPoint'
import EndPoint from '../src/contour/global/EndPoint'

describe('PointD', () => {
  it('defaults to (0, 0)', () => {
    const p = new PointD()
    expect(p.x).toBe(0)
    expect(p.y).toBe(0)
  })

  it('constructs with given coordinates', () => {
    const p = new PointD(3, 5)
    expect(p.x).toBe(3)
    expect(p.y).toBe(5)
  })

  it('clone produces an independent copy', () => {
    const p = new PointD(7, 9)
    const c = p.clone()
    expect(c.x).toBe(7)
    expect(c.y).toBe(9)
    // Mutating clone should not affect original
    c.x = 100
    c.y = 200
    expect(p.x).toBe(7)
    expect(p.y).toBe(9)
  })
})

describe('Extent', () => {
  it('constructs with undefined fields by default', () => {
    const e = new Extent()
    expect(e.xMin).toBeUndefined()
    expect(e.xMax).toBeUndefined()
    expect(e.yMin).toBeUndefined()
    expect(e.yMax).toBeUndefined()
  })

  it('constructs with given bounds', () => {
    const e = new Extent(1, 3, 2, 4)
    expect(e.xMin).toBe(1)
    expect(e.xMax).toBe(3)
    expect(e.yMin).toBe(2)
    expect(e.yMax).toBe(4)
  })

  describe('include', () => {
    const outer = new Extent(0, 100, 0, 100)

    it('returns true for a fully-contained extent', () => {
      expect(outer.include(new Extent(10, 50, 10, 50))).toBe(true)
    })

    it('returns true for an identical extent (boundary inclusive)', () => {
      expect(outer.include(new Extent(0, 100, 0, 100))).toBe(true)
    })

    it('returns true for an extent touching the boundary', () => {
      expect(outer.include(new Extent(0, 100, 0, 100))).toBe(true)
    })

    it('returns false for an extent that exceeds xMax', () => {
      expect(outer.include(new Extent(0, 101, 0, 100))).toBe(false)
    })

    it('returns false for an extent that is below xMin', () => {
      expect(outer.include(new Extent(-1, 50, 0, 100))).toBe(false)
    })

    it('returns false for an extent that exceeds yMax', () => {
      expect(outer.include(new Extent(0, 100, 0, 101))).toBe(false)
    })

    it('returns false for an extent that is below yMin', () => {
      expect(outer.include(new Extent(0, 100, -1, 100))).toBe(false)
    })
  })
})

describe('Polygon', () => {
  it('has empty holeLines by default', () => {
    const p = new Polygon()
    expect(p.hasHoles()).toBe(false)
    expect(p.holeLines).toHaveLength(0)
  })

  it('has an outLine PolyLine by default', () => {
    const p = new Polygon()
    expect(p.outLine).toBeInstanceOf(PolyLine)
    expect(p.outLine.pointList).toHaveLength(0)
  })

  describe('addHole', () => {
    it('adds hole from a PointD[] array', () => {
      const polygon = new Polygon()
      // counter-clockwise so it is NOT reversed
      const holePoints = [new PointD(5, 5), new PointD(5, 15), new PointD(15, 15), new PointD(15, 5), new PointD(5, 5)]
      polygon.addHole(holePoints)
      expect(polygon.hasHoles()).toBe(true)
      expect(polygon.holeLines).toHaveLength(1)
      expect(polygon.holeLines[0].pointList).toHaveLength(5)
    })

    it('reverses clockwise point arrays when adding as hole', () => {
      const polygon = new Polygon()
      // clockwise: (0,0) → (0,10) → (10,10) → (10,0) → (0,0)
      const cwPoints = [new PointD(0, 0), new PointD(0, 10), new PointD(10, 10), new PointD(10, 0), new PointD(0, 0)]
      polygon.addHole(cwPoints)
      // addHole reverses clockwise arrays
      expect(polygon.holeLines[0].pointList[0]).toEqual({ x: 0, y: 0 })
      expect(polygon.holeLines[0].pointList[1]).toEqual({ x: 10, y: 0 })
    })

    it('adds hole from a Polygon instance (uses its outLine)', () => {
      const outer = new Polygon()
      const inner = new Polygon()
      inner.outLine.pointList = [
        new PointD(2, 2),
        new PointD(2, 8),
        new PointD(8, 8),
        new PointD(8, 2),
        new PointD(2, 2),
      ]
      outer.addHole(inner)
      expect(outer.hasHoles()).toBe(true)
      expect(outer.holeLines[0]).toBe(inner.outLine)
    })
  })

  describe('clone', () => {
    it('copies all properties', () => {
      const p = new Polygon()
      p.isBorder = true
      p.lowValue = 10
      p.highValue = 20
      p.isClockWise = true
      p.startPointIdx = 3
      p.isHighCenter = false
      p.area = 100
      p.holeIndex = 2

      const c = p.clone()
      expect(c.isBorder).toBe(true)
      expect(c.lowValue).toBe(10)
      expect(c.highValue).toBe(20)
      expect(c.isClockWise).toBe(true)
      expect(c.startPointIdx).toBe(3)
      expect(c.isHighCenter).toBe(false)
      expect(c.area).toBe(100)
      expect(c.holeIndex).toBe(2)
    })
  })
})

describe('BorderPoint', () => {
  it('has a default PointD point', () => {
    const bp = new BorderPoint()
    expect(bp.point).toBeInstanceOf(PointD)
    expect(bp.point.x).toBe(0)
    expect(bp.point.y).toBe(0)
  })

  it('clone copies all fields', () => {
    const bp = new BorderPoint()
    bp.id = 5
    bp.borderIdx = 2
    bp.bInnerIdx = 10
    bp.point = new PointD(3, 7)
    bp.value = 42

    const c = bp.clone()
    expect(c.id).toBe(5)
    expect(c.borderIdx).toBe(2)
    expect(c.bInnerIdx).toBe(10)
    expect(c.point.x).toBe(3)
    expect(c.point.y).toBe(7)
    expect(c.value).toBe(42)
  })
})

describe('Border', () => {
  it('has empty lineList by default', () => {
    const b = new Border()
    expect(b.getLineNum()).toBe(0)
  })

  it('getLineNum returns correct count after adding lines', () => {
    const b = new Border()
    b.lineList.push(new BorderLine())
    b.lineList.push(new BorderLine())
    b.lineList.push(new BorderLine())
    expect(b.getLineNum()).toBe(3)
  })
})

describe('PolyLine', () => {
  it('has empty pointList by default', () => {
    const pl = new PolyLine()
    expect(pl.pointList).toHaveLength(0)
  })
})

describe('BorderLine', () => {
  it('has empty pointList and ijPointList by default', () => {
    const bl = new BorderLine()
    expect(bl.pointList).toHaveLength(0)
    expect(bl.ijPointList).toHaveLength(0)
    expect(bl.extent).toBeInstanceOf(Extent)
  })
})

describe('IJPoint', () => {
  it('constructs with i and j', () => {
    const p = new IJPoint(3, 5)
    expect(p.i).toBe(3)
    expect(p.j).toBe(5)
  })
})

describe('EndPoint', () => {
  it('has default sPoint and point as PointD instances', () => {
    const ep = new EndPoint()
    expect(ep.sPoint).toBeInstanceOf(PointD)
    expect(ep.point).toBeInstanceOf(PointD)
  })
})
