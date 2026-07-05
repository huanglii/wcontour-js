import { describe, expect, it } from 'vitest'
import BorderPoint from '../src/contour/global/BorderPoint'
import PointD from '../src/contour/global/PointD'
import PolyLine from '../src/contour/global/PolyLine'
import Polygon from '../src/contour/global/Polygon'
import {
  canTraceBorder,
  canTraceIsoline_UndefData,
  tracingClipPolygons,
  tracingStreamlinePoint
} from '../src/contour/utils/trace'
import { Contour } from '../src/index'

// ---------------------------------------------------------------------------
// canTraceBorder — determines the next border grid cell to trace.
// Four trace directions: bottom (i1<i2), left (j1<j2), top (i1>i2), right (j1>j2)
// ---------------------------------------------------------------------------

describe('canTraceBorder', () => {
  // Build a 5×5 grid of zeros by default; tests will set specific cells to 1.
  function makeGrid(): number[][] {
    const g: number[][] = []
    for (let i = 0; i < 5; i++) {
      g[i] = [0, 0, 0, 0, 0]
    }
    return g
  }

  describe('trace from bottom (i1 < i2)', () => {
    it('traces to j2-1 when both left and right are 1 and the diagonal favors left', () => {
      const s = makeGrid()
      // current cell (i2=2, j2=2); left and right are 1
      s[2][1] = 1
      s[2][3] = 1
      // a = s[i2-1][j2-1], b = s[i2+1][j2]
      // Set a != 0, b === 0 -> goes to j2-1
      s[1][1] = 1
      s[3][2] = 0
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 1, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(1) // j2 - 1
    })

    it('traces to j2+1 when both left and right are 1 and the diagonal favors right', () => {
      const s = makeGrid()
      s[2][1] = 1
      s[2][3] = 1
      // a = s[i2-1][j2-1], b = s[i2+1][j2], c = s[i2+1][j2-1]
      // For else (j2+1): condition must be false -> a!=0 and b!=0
      s[1][1] = 1
      s[3][2] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 1, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(3) // j2 + 1
    })

    it('traces to j2-1 when only left is 1', () => {
      const s = makeGrid()
      s[2][1] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 1, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(1)
    })

    it('traces to j2+1 when only right is 1', () => {
      const s = makeGrid()
      s[2][3] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 1, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(3)
    })

    it('traces to i2+1 when only bottom is 1', () => {
      const s = makeGrid()
      s[3][2] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 1, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(3)
      expect(ij3[1]).toBe(2)
    })

    it('returns false when no neighbor is 1', () => {
      const s = makeGrid()
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 1, 2, 2, 2, ij3)
      expect(result).toBe(false)
    })

    it('handles left+bottom case tracing to bottom', () => {
      const s = makeGrid()
      s[2][1] = 1 // left
      s[3][2] = 1 // bottom
      // a=s[3][1], b=s[3][3], c=s[2][1], d=s[2][3]
      // a=0 -> enters first branch, (a===0 && d===0) is true since d=0 -> goes to j2-1
      // Wait, re-read: if a===0 || b===0 || c===0 || d===0
      // Then if (a===0 && d===0) || (b===0 && c===0) -> j2-1, else i2+1
      // a=s[3][1]=0, d=s[2][3]=0 -> condition true -> j2-1
      s[3][1] = 0
      s[3][3] = 0
      s[2][3] = 0
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 1, 2, 2, 2, ij3)
      expect(result).toBe(true)
      // Should go to j2-1 since (a===0 && d===0)
      expect(ij3[1]).toBe(1)
    })
  })

  describe('trace from left (j1 < j2)', () => {
    it('traces down when top and bottom are 1', () => {
      const s = makeGrid()
      // current (i2=2, j2=2), from left means j1 < j2
      s[3][2] = 1 // bottom (i2+1)
      s[1][2] = 1 // top (i2-1)
      // a=s[3][1], b=s[2][3], c=s[3][3]
      // a != 0 && b === 0 -> i2+1
      s[3][1] = 1
      s[2][3] = 0
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 1, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(3)
      expect(ij3[1]).toBe(2)
    })

    it('traces up when both top and bottom are 1 and diagonal favors up', () => {
      const s = makeGrid()
      s[3][2] = 1
      s[1][2] = 1
      // a=s[3][1], b=s[2][3], c=s[3][3]
      // For else (up): condition must be false -> a!=0 and b!=0
      s[3][1] = 1
      s[2][3] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 1, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(1)
      expect(ij3[1]).toBe(2)
    })

    it('traces down when only bottom is 1', () => {
      const s = makeGrid()
      s[3][2] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 1, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(3)
      expect(ij3[1]).toBe(2)
    })

    it('traces up when only top is 1', () => {
      const s = makeGrid()
      s[1][2] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 1, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(1)
      expect(ij3[1]).toBe(2)
    })

    it('traces right when only right is 1', () => {
      const s = makeGrid()
      s[2][3] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 1, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(3)
    })

    it('returns false when no neighbor is 1', () => {
      const s = makeGrid()
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 1, 2, ij3)
      expect(result).toBe(false)
    })
  })

  describe('trace from top (i1 > i2)', () => {
    it('traces to j2-1 when both left and right are 1 and diagonal favors left', () => {
      const s = makeGrid()
      // current (i2=2, j2=2), from top means i1 > i2
      s[2][1] = 1 // left
      s[2][3] = 1 // right
      // a=s[3][1], b=s[1][2], c=s[1][3]
      // a != 0 && b === 0 -> j2-1
      s[3][1] = 1
      s[1][2] = 0
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 3, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(1)
    })

    it('traces to j2+1 when both left and right are 1 and diagonal favors right', () => {
      const s = makeGrid()
      s[2][1] = 1
      s[2][3] = 1
      // a=s[3][1], b=s[1][2], c=s[1][3]
      // For else (j2+1): condition must be false -> a!=0 and b!=0
      s[3][1] = 1
      s[1][2] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 3, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(3)
    })

    it('traces to j2-1 when only left is 1', () => {
      const s = makeGrid()
      s[2][1] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 3, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(1)
    })

    it('traces to i2-1 when only top is 1', () => {
      const s = makeGrid()
      s[1][2] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 3, 2, 2, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(1)
      expect(ij3[1]).toBe(2)
    })

    it('returns false when no neighbor is 1', () => {
      const s = makeGrid()
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 3, 2, 2, 2, ij3)
      expect(result).toBe(false)
    })
  })

  describe('trace from right (j1 > j2)', () => {
    it('traces down when top and bottom are 1', () => {
      const s = makeGrid()
      // current (i2=2, j2=2), from right means j1 > j2
      s[3][2] = 1 // bottom
      s[1][2] = 1 // top
      // a=s[3][3], b=s[2][1], c=s[1][1]
      // a != 0 && b === 0 -> i2+1
      s[3][3] = 1
      s[2][1] = 0
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 3, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(3)
      expect(ij3[1]).toBe(2)
    })

    it('traces up when top and bottom are 1 and diagonal favors up', () => {
      const s = makeGrid()
      s[3][2] = 1
      s[1][2] = 1
      // a=s[3][3], b=s[2][1], c=s[1][1]
      // For else (up): condition must be false -> a!=0 and b!=0
      s[3][3] = 1
      s[2][1] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 3, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(1)
      expect(ij3[1]).toBe(2)
    })

    it('traces down when only bottom is 1', () => {
      const s = makeGrid()
      s[3][2] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 3, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(3)
      expect(ij3[1]).toBe(2)
    })

    it('traces left when only left is 1', () => {
      const s = makeGrid()
      s[2][1] = 1
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 3, 2, ij3)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(1)
    })

    it('returns false when no neighbor is 1', () => {
      const s = makeGrid()
      const ij3 = [0, 0]
      const result = canTraceBorder(s, 2, 2, 3, 2, ij3)
      expect(result).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// canTraceIsoline_UndefData — traces the next point of an isoline
// ---------------------------------------------------------------------------

describe('canTraceIsoline_UndefData', () => {
  // X and Y coordinate arrays
  const X = [0, 10, 20, 30, 40]
  const Y = [0, 1, 2, 3, 4]

  function makeHS(): { H: number[][]; S: number[][] } {
    // H[i][j] and S[i][j], initialized to 0.5 (non -2)
    const H: number[][] = []
    const S: number[][] = []
    for (let i = 0; i < 5; i++) {
      H[i] = [0.5, 0.5, 0.5, 0.5, 0.5]
      S[i] = [0.5, 0.5, 0.5, 0.5, 0.5]
    }
    return { H, S }
  }

  describe('trace from bottom (i1 < i2)', () => {
    it('traces to H[i2][j2] when H[i2][j2] < H[i2][j2+1]', () => {
      const { H, S } = makeHS()
      H[2][2] = 0.3
      H[2][3] = 0.7
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(1, 2, H, S, 2, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(2) // j2 (smaller H)
      expect(IsS[0]).toBe(false) // H was used
      expect(H[2][2]).toBe(-2) // marked as used
    })

    it('traces to H[i2][j2+1] when H[i2][j2] >= H[i2][j2+1]', () => {
      const { H, S } = makeHS()
      H[2][2] = 0.7
      H[2][3] = 0.3
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(1, 2, H, S, 2, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(3) // j2+1 (smaller H)
      expect(IsS[0]).toBe(false)
    })

    it('traces to H[i2][j2] when H[i2][j2+1] is -2', () => {
      const { H, S } = makeHS()
      H[2][2] = 0.5
      H[2][3] = -2
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(1, 2, H, S, 2, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[1]).toBe(2)
      expect(IsS[0]).toBe(false)
    })

    it('traces to S[i2+1][j2] when both H are -2', () => {
      const { H, S } = makeHS()
      H[2][2] = -2
      H[2][3] = -2
      S[3][2] = 0.4
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [false]
      const result = canTraceIsoline_UndefData(1, 2, H, S, 2, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(3)
      expect(ij3[1]).toBe(2)
      expect(IsS[0]).toBe(true) // S was used
    })

    it('returns false when all neighbors are -2', () => {
      const { H, S } = makeHS()
      H[2][2] = -2
      H[2][3] = -2
      S[3][2] = -2
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(1, 2, H, S, 2, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(false)
    })
  })

  describe('trace from left (j1 < j2)', () => {
    it('traces to S[i2][j2] when S[i2][j2] < S[i2+1][j2]', () => {
      const { H, S } = makeHS()
      S[2][2] = 0.3
      S[3][2] = 0.7
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [false]
      const result = canTraceIsoline_UndefData(2, 2, H, S, 1, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(2)
      expect(IsS[0]).toBe(true)
    })

    it('traces to S[i2+1][j2] when S[i2][j2] >= S[i2+1][j2]', () => {
      const { H, S } = makeHS()
      S[2][2] = 0.7
      S[3][2] = 0.3
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [false]
      const result = canTraceIsoline_UndefData(2, 2, H, S, 1, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(3)
      expect(ij3[1]).toBe(2)
      expect(IsS[0]).toBe(true)
    })

    it('traces to H[i2][j2+1] when both S are -2', () => {
      const { H, S } = makeHS()
      S[2][2] = -2
      S[3][2] = -2
      H[2][3] = 0.4
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(2, 2, H, S, 1, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(3)
      expect(IsS[0]).toBe(false)
    })

    it('returns false when all neighbors are -2', () => {
      const { H, S } = makeHS()
      S[2][2] = -2
      S[3][2] = -2
      H[2][3] = -2
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(2, 2, H, S, 1, 2, X, Y, X[2], ij3, a3xy, IsS)
      expect(result).toBe(false)
    })
  })

  describe('trace from top (X[j2] < a2x)', () => {
    it('traces to H[i2-1][j2] when H[i2-1][j2] > H[i2-1][j2+1]', () => {
      const { H, S } = makeHS()
      H[1][2] = 0.7
      H[1][3] = 0.3
      // X[j2] < a2x: X[2]=20 < a2x=30
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(3, 2, H, S, 2, 2, X, Y, 30, ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(1)
      expect(ij3[1]).toBe(2)
      expect(IsS[0]).toBe(false)
    })

    it('traces to H[i2-1][j2+1] when H[i2-1][j2] <= H[i2-1][j2+1]', () => {
      const { H, S } = makeHS()
      H[1][2] = 0.3
      H[1][3] = 0.7
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(3, 2, H, S, 2, 2, X, Y, 30, ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(1)
      expect(ij3[1]).toBe(3)
      expect(IsS[0]).toBe(false)
    })

    it('traces to S[i2-1][j2] when both H are -2', () => {
      const { H, S } = makeHS()
      H[1][2] = -2
      H[1][3] = -2
      S[1][2] = 0.4
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [false]
      const result = canTraceIsoline_UndefData(3, 2, H, S, 2, 2, X, Y, 30, ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(1)
      expect(ij3[1]).toBe(2)
      expect(IsS[0]).toBe(true)
    })

    it('returns false when all neighbors are -2', () => {
      const { H, S } = makeHS()
      H[1][2] = -2
      H[1][3] = -2
      S[1][2] = -2
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(3, 2, H, S, 2, 2, X, Y, 30, ij3, a3xy, IsS)
      expect(result).toBe(false)
    })
  })

  describe('trace from right (else branch)', () => {
    it('traces to S[i2+1][j2-1] when S[i2+1][j2-1] > S[i2][j2-1]', () => {
      const { H, S } = makeHS()
      S[3][1] = 0.7
      S[2][1] = 0.3
      // else branch: X[j2] >= a2x -> X[2]=20 >= a2x=10
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [false]
      const result = canTraceIsoline_UndefData(2, 2, H, S, 3, 2, X, Y, 10, ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(3)
      expect(ij3[1]).toBe(1)
      expect(IsS[0]).toBe(true)
    })

    it('traces to S[i2][j2-1] when S[i2+1][j2-1] <= S[i2][j2-1]', () => {
      const { H, S } = makeHS()
      S[3][1] = 0.3
      S[2][1] = 0.7
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [false]
      const result = canTraceIsoline_UndefData(2, 2, H, S, 3, 2, X, Y, 10, ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(1)
      expect(IsS[0]).toBe(true)
    })

    it('traces to H[i2][j2-1] when both S are -2', () => {
      const { H, S } = makeHS()
      S[3][1] = -2
      S[2][1] = -2
      H[2][1] = 0.4
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(2, 2, H, S, 3, 2, X, Y, 10, ij3, a3xy, IsS)
      expect(result).toBe(true)
      expect(ij3[0]).toBe(2)
      expect(ij3[1]).toBe(1)
      expect(IsS[0]).toBe(false)
    })

    it('returns false when all neighbors are -2', () => {
      const { H, S } = makeHS()
      S[3][1] = -2
      S[2][1] = -2
      H[2][1] = -2
      const ij3 = [0, 0]
      const a3xy = [0, 0]
      const IsS = [true]
      const result = canTraceIsoline_UndefData(2, 2, H, S, 3, 2, X, Y, 10, ij3, a3xy, IsS)
      expect(result).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// tracingStreamlinePoint — traces a single streamline point by interpolating
// U/V displacement and moving the point forward or backward.
// ---------------------------------------------------------------------------

describe('tracingStreamlinePoint', () => {
  const X = [0, 1, 2, 3, 4, 5]
  const Y = [0, 1, 2, 3, 4, 5]

  function makeUV(): { U: number[][]; V: number[][] } {
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < 6; i++) {
      U[i] = [1, 1, 1, 1, 1, 1]
      V[i] = [0, 0, 0, 0, 0, 0]
    }
    return { U, V }
  }

  it('moves point forward with uniform eastward flow', () => {
    const { U, V } = makeUV()
    const point = new PointD(1.5, 2.5)
    const iijj = [2, 1]
    const result = tracingStreamlinePoint(point, U, V, X, Y, iijj, true)
    expect(result).toBe(true)
    // dx = 1, dy = 0 -> point moves by (1, 0)
    expect(point.x).toBeCloseTo(2.5, 5)
    expect(point.y).toBeCloseTo(2.5, 5)
    // Still in the same grid box
    expect(iijj[0]).toBe(2)
    expect(iijj[1]).toBe(2)
  })

  it('moves point backward with uniform eastward flow', () => {
    const { U, V } = makeUV()
    const point = new PointD(1.5, 2.5)
    const iijj = [2, 1]
    const result = tracingStreamlinePoint(point, U, V, X, Y, iijj, false)
    expect(result).toBe(true)
    // backward: point moves by (-1, 0)
    expect(point.x).toBeCloseTo(0.5, 5)
    expect(point.y).toBeCloseTo(2.5, 5)
  })

  it('updates grid box when point moves to a new cell', () => {
    const { U, V } = makeUV()
    const point = new PointD(0.5, 0.5)
    const iijj = [0, 0]
    // Forward: moves to (1.5, 0.5) which is in cell (0, 1)
    const result = tracingStreamlinePoint(point, U, V, X, Y, iijj, true)
    expect(result).toBe(true)
    expect(point.x).toBeCloseTo(1.5, 5)
    expect(iijj[0]).toBe(0)
    expect(iijj[1]).toBe(1)
  })

  it('returns false when point moves out of bounds', () => {
    const { U, V } = makeUV()
    const point = new PointD(0.1, 0.1)
    const iijj = [0, 0]
    // Forward: moves to (1.1, 0.1) - still in bounds
    // But with large U, point could go out
    U[0][0] = 100
    U[0][1] = 100
    U[1][0] = 100
    U[1][1] = 100
    const result = tracingStreamlinePoint(point, U, V, X, Y, iijj, true)
    expect(result).toBe(false)
  })

  it('interpolates U/V correctly with bilinear interpolation', () => {
    // Set up a flow where U varies linearly
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < 6; i++) {
      U[i] = []
      V[i] = []
      for (let j = 0; j < 6; j++) {
        U[i][j] = j // U increases with x
        V[i][j] = 0
      }
    }
    const point = new PointD(1.5, 1.5)
    const iijj = [1, 1]
    const result = tracingStreamlinePoint(point, U, V, X, Y, iijj, true)
    expect(result).toBe(true)
    // Bilinear interpolation of U at (1.5, 1.5):
    // U[1][1]=1, U[1][2]=2, U[2][1]=1, U[2][2]=2
    // All average to 1.5
    expect(point.x).toBeCloseTo(3.0, 5) // 1.5 + 1.5
    expect(point.y).toBeCloseTo(1.5, 5)
  })

  it('handles vertical flow (V component only)', () => {
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < 6; i++) {
      U[i] = [0, 0, 0, 0, 0, 0]
      V[i] = [1, 1, 1, 1, 1, 1]
    }
    const point = new PointD(2.5, 1.5)
    const iijj = [1, 2]
    const result = tracingStreamlinePoint(point, U, V, X, Y, iijj, true)
    expect(result).toBe(true)
    // dx = 0, dy = 1 -> point moves by (0, 1)
    expect(point.x).toBeCloseTo(2.5, 5)
    expect(point.y).toBeCloseTo(2.5, 5)
  })

  it('handles diagonal flow', () => {
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < 6; i++) {
      U[i] = [1, 1, 1, 1, 1, 1]
      V[i] = [1, 1, 1, 1, 1, 1]
    }
    const point = new PointD(1.5, 1.5)
    const iijj = [1, 1]
    const result = tracingStreamlinePoint(point, U, V, X, Y, iijj, true)
    expect(result).toBe(true)
    // dx = 1, dy = 1 -> point moves by (1, 1)
    expect(point.x).toBeCloseTo(2.5, 5)
    expect(point.y).toBeCloseTo(2.5, 5)
  })

  it('点移动到新的网格框时正确更新 ii/jj（跨格）', () => {
    const xs = [0, 1, 2, 3, 4, 5, 6]
    const ys = [0, 1, 2, 3, 4, 5, 6]
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < 7; i++) {
      U[i] = [2, 2, 2, 2, 2, 2, 2] // 移动 2 个单位（在 ±2 搜索范围内）
      V[i] = [0, 0, 0, 0, 0, 0, 0]
    }
    const point = new PointD(0.5, 3.5)
    const iijj = [3, 0]
    const result = tracingStreamlinePoint(point, U, V, xs, ys, iijj, true)
    expect(result).toBe(true)
    expect(point.x).toBeCloseTo(2.5, 5)
    expect(iijj[0]).toBe(3)
    expect(iijj[1]).toBe(2) // 从 j=0 跨到 j=2
  })

  it('反向移动到新的网格框时正确更新 ii/jj', () => {
    const xs = [0, 1, 2, 3, 4, 5, 6]
    const ys = [0, 1, 2, 3, 4, 5, 6]
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < 7; i++) {
      U[i] = [2, 2, 2, 2, 2, 2, 2]
      V[i] = [1, 1, 1, 1, 1, 1, 1]
    }
    const point = new PointD(3.5, 3.5)
    const iijj = [3, 3]
    const result = tracingStreamlinePoint(point, U, V, xs, ys, iijj, false)
    expect(result).toBe(true)
    // 反向移动 dx=-2, dy=-1 -> (1.5, 2.5)
    expect(point.x).toBeCloseTo(1.5, 5)
    expect(point.y).toBeCloseTo(2.5, 5)
    expect(iijj[0]).toBe(2)
    expect(iijj[1]).toBe(1)
  })

  it('点在 y 方向越界时返回 false', () => {
    const xs = [0, 1, 2, 3, 4]
    const ys = [0, 1, 2, 3, 4]
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < 5; i++) {
      U[i] = [0, 0, 0, 0, 0]
      V[i] = [100, 100, 100, 100, 100] // y 方向大移动
    }
    const point = new PointD(2.5, 0.1)
    const iijj = [0, 2]
    const result = tracingStreamlinePoint(point, U, V, xs, ys, iijj, true)
    expect(result).toBe(false)
  })

  it('反向移动越界时返回 false', () => {
    const xs = [0, 1, 2, 3, 4]
    const ys = [0, 1, 2, 3, 4]
    const U: number[][] = []
    const V: number[][] = []
    for (let i = 0; i < 5; i++) {
      U[i] = [100, 100, 100, 100, 100]
      V[i] = [0, 0, 0, 0, 0]
    }
    const point = new PointD(0.5, 2.5)
    const iijj = [2, 0]
    const result = tracingStreamlinePoint(point, U, V, xs, ys, iijj, false)
    expect(result).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// tracingPolygons_Ring — 通过 Contour 集成测试间接覆盖
// ---------------------------------------------------------------------------

describe('tracingPolygons_Ring - 通过 Contour 集成测试覆盖', () => {
  it('简单梯度网格生成边界多边形', () => {
    const xs = [0, 1, 2, 3, 4, 5]
    const ys = [0, 1, 2, 3, 4, 5]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 6; i++) {
      data[i] = []
      for (let j = 0; j < 6; j++) {
        data[i][j] = j * 20
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 30, 50, 70]
    const lines = contour.tracingContourLines(breaks)
    expect(lines.length).toBeGreaterThan(0)

    const polygons = contour.tracingPolygons(lines, breaks)
    expect(polygons.length).toBeGreaterThan(0)

    // 至少有一个边界多边形
    const borderPolygons = polygons.filter((p) => p.isBorder)
    expect(borderPolygons.length).toBeGreaterThan(0)

    // 所有多边形都应有有效的 extent
    for (const p of polygons) {
      expect(p.extent).toBeDefined()
      expect(p.outLine.pointList.length).toBeGreaterThan(0)
    }
  })

  it('峰值网格生成闭合多边形和边界多边形', () => {
    const xs = [0, 1, 2, 3, 4, 5, 6, 7]
    const ys = [0, 1, 2, 3, 4, 5, 6, 7]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 8; i++) {
      data[i] = []
      for (let j = 0; j < 8; j++) {
        const dist = Math.max(Math.abs(i - 4), Math.abs(j - 4))
        data[i][j] = 70 - dist * 10
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30, 40, 50, 60]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)

    expect(polygons.length).toBeGreaterThan(0)

    // 应包含闭合多边形
    const closePolygons = polygons.filter((p) => p.outLine.type === 'Close')
    expect(closePolygons.length).toBeGreaterThan(0)

    // 应包含高中心多边形
    const highCenter = polygons.filter((p) => p.isHighCenter)
    expect(highCenter.length).toBeGreaterThan(0)
  })

  it('山谷网格生成低中心多边形', () => {
    const xs = [0, 1, 2, 3, 4, 5, 6, 7]
    const ys = [0, 1, 2, 3, 4, 5, 6, 7]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 8; i++) {
      data[i] = []
      for (let j = 0; j < 8; j++) {
        const dist = Math.max(Math.abs(i - 4), Math.abs(j - 4))
        data[i][j] = dist * 10
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30, 40, 50]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)

    expect(polygons.length).toBeGreaterThan(0)

    // 山谷应包含低中心多边形
    const lowCenter = polygons.filter((p) => !p.isHighCenter)
    expect(lowCenter.length).toBeGreaterThan(0)
  })

  it('均匀值网格生成单个边界多边形', () => {
    const xs = [0, 1, 2, 3, 4, 5]
    const ys = [0, 1, 2, 3, 4, 5]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 6; i++) {
      data[i] = []
      for (let j = 0; j < 6; j++) {
        data[i][j] = 100
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [50]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)

    expect(polygons.length).toBeGreaterThan(0)
    expect(polygons[0].isBorder).toBe(true)
    // 值 100 > break 50，所以 isHighCenter 应为 true
    expect(polygons[0].isHighCenter).toBe(true)
  })

  it('带 undefined 数据的网格能正确生成多边形', () => {
    const xs = [0, 1, 2, 3, 4, 5, 6]
    const ys = [0, 1, 2, 3, 4, 5, 6]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 7; i++) {
      data[i] = []
      for (let j = 0; j < 7; j++) {
        if (i === 3 && j === 3) {
          data[i][j] = undefData
        } else {
          const dist = Math.max(Math.abs(i - 3), Math.abs(j - 3))
          data[i][j] = 50 - dist * 5
        }
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 20, 30, 40]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)

    expect(polygons.length).toBeGreaterThan(0)
  })

  it('多 break 值生成嵌套多边形', () => {
    const xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const ys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const undefData = 999999
    const data: number[][] = []
    for (let i = 0; i < 10; i++) {
      data[i] = []
      for (let j = 0; j < 10; j++) {
        const dist = Math.sqrt((i - 5) ** 2 + (j - 5) ** 2)
        data[i][j] = 100 - dist * 10
      }
    }

    const contour = new Contour(data, xs, ys, undefData)
    const breaks = [10, 30, 50, 70, 90]
    const lines = contour.tracingContourLines(breaks)
    const polygons = contour.tracingPolygons(lines, breaks)

    expect(polygons.length).toBeGreaterThan(3)
    // 应有多个闭合多边形
    const closePolygons = polygons.filter((p) => p.outLine.type === 'Close')
    expect(closePolygons.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// tracingClipPolygons — 直接单元测试
// ---------------------------------------------------------------------------

describe('tracingClipPolygons', () => {
  function makeBorderPoint(
    id: number,
    borderIdx: number,
    bInnerIdx: number,
    x: number,
    y: number,
    value: number,
  ): BorderPoint {
    const bp = new BorderPoint()
    bp.id = id
    bp.borderIdx = borderIdx
    bp.bInnerIdx = bInnerIdx
    bp.point = new PointD(x, y)
    bp.value = value
    return bp
  }

  it('LineList 为空时返回空数组', () => {
    const inPolygon = new Polygon()
    inPolygon.lowValue = 10
    inPolygon.highValue = 20
    inPolygon.isHighCenter = true
    inPolygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 10),
      new PointD(10, 10),
      new PointD(10, 0),
      new PointD(0, 0),
    ]

    const result = tracingClipPolygons(inPolygon, [], [])
    expect(result).toEqual([])
  })

  it('LineList 非空但 borderList 为空时不崩溃', () => {
    const inPolygon = new Polygon()
    inPolygon.lowValue = 0
    inPolygon.highValue = 50
    inPolygon.isHighCenter = true
    inPolygon.outLine.pointList = [
      new PointD(0, 0),
      new PointD(0, 10),
      new PointD(10, 10),
      new PointD(10, 0),
      new PointD(0, 0),
    ]

    const line = new PolyLine()
    line.value = 25
    line.pointList = [new PointD(2, 0), new PointD(2, 10)]
    const lineList: PolyLine[] = [line]

    // borderList 只有一个哨兵元素
    const result = tracingClipPolygons(inPolygon, lineList, [makeBorderPoint(-1, 0, 0, 0, 0, 10)])
    expect(result).toEqual([])
  })
})
