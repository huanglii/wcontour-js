import Extent from './global/Extent'
import Line from './global/Line'
import PointD from './global/PointD'
import PolyLine from './global/PolyLine'

export function traceBorder(
  s1: number[][],
  i1: number,
  i2: number,
  j1: number,
  j2: number,
  ij3: number[]
): boolean {
  let canTrace = true
  let a: number, b: number, c: number, d: number
  if (i1 < i2) {
    //---- Trace from bottom
    if (s1[i2][j2 - 1] === 1 && s1[i2][j2 + 1] === 1) {
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 + 1][j2]
      c = s1[i2 + 1][j2 - 1]
      if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
        ij3[0] = i2
        ij3[1] = j2 - 1
      } else {
        ij3[0] = i2
        ij3[1] = j2 + 1
      }
    } else if (s1[i2][j2 - 1] === 1 && s1[i2 + 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1]
      b = s1[i2 + 1][j2 + 1]
      c = s1[i2][j2 - 1]
      d = s1[i2][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2
          ij3[1] = j2 - 1
        } else {
          ij3[0] = i2 + 1
          ij3[1] = j2
        }
      } else {
        ij3[0] = i2
        ij3[1] = j2 - 1
      }
    } else if (s1[i2][j2 + 1] === 1 && s1[i2 + 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1]
      b = s1[i2 + 1][j2 + 1]
      c = s1[i2][j2 - 1]
      d = s1[i2][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2
          ij3[1] = j2 + 1
        } else {
          ij3[0] = i2 + 1
          ij3[1] = j2
        }
      } else {
        ij3[0] = i2
        ij3[1] = j2 + 1
      }
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 - 1
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 + 1
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1
      ij3[1] = j2
    } else {
      canTrace = false
    }
  } else if (j1 < j2) {
    //---- Trace from left
    if (s1[i2 + 1][j2] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 + 1][j2 - 1]
      b = s1[i2][j2 + 1]
      c = s1[i2 + 1][j2 + 1]
      if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
        ij3[0] = i2 + 1
        ij3[1] = j2
      } else {
        ij3[0] = i2 - 1
        ij3[1] = j2
      }
    } else if (s1[i2 + 1][j2] === 1 && s1[i2][j2 + 1] === 1) {
      c = s1[i2 - 1][j2]
      d = s1[i2 + 1][j2]
      a = s1[i2 - 1][j2 + 1]
      b = s1[i2 + 1][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2 + 1
          ij3[1] = j2
        } else {
          ij3[0] = i2
          ij3[1] = j2 + 1
        }
      } else {
        ij3[0] = i2 + 1
        ij3[1] = j2
      }
    } else if (s1[i2 - 1][j2] === 1 && s1[i2][j2 + 1] === 1) {
      c = s1[i2 - 1][j2]
      d = s1[i2 + 1][j2]
      a = s1[i2 - 1][j2 + 1]
      b = s1[i2 + 1][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2 - 1
          ij3[1] = j2
        } else {
          ij3[0] = i2
          ij3[1] = j2 + 1
        }
      } else {
        ij3[0] = i2 - 1
        ij3[1] = j2
      }
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1
      ij3[1] = j2
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1
      ij3[1] = j2
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 + 1
    } else {
      canTrace = false
    }
  } else if (i1 > i2) {
    //---- Trace from top
    if (s1[i2][j2 - 1] === 1 && s1[i2][j2 + 1] === 1) {
      a = s1[i2 + 1][j2 - 1]
      b = s1[i2 - 1][j2]
      c = s1[i2 - 1][j2 + 1]
      if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
        ij3[0] = i2
        ij3[1] = j2 - 1
      } else {
        ij3[0] = i2
        ij3[1] = j2 + 1
      }
    } else if (s1[i2][j2 - 1] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 - 1][j2 + 1]
      c = s1[i2][j2 - 1]
      d = s1[i2][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2
          ij3[1] = j2 - 1
        } else {
          ij3[0] = i2 - 1
          ij3[1] = j2
        }
      } else {
        ij3[0] = i2
        ij3[1] = j2 - 1
      }
    } else if (s1[i2][j2 + 1] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 - 1][j2 + 1]
      c = s1[i2][j2 - 1]
      d = s1[i2][j2 + 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2
          ij3[1] = j2 + 1
        } else {
          ij3[0] = i2 - 1
          ij3[1] = j2
        }
      } else {
        ij3[0] = i2
        ij3[1] = j2 + 1
      }
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 - 1
    } else if (s1[i2][j2 + 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 + 1
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1
      ij3[1] = j2
    } else {
      canTrace = false
    }
  } else if (j1 > j2) {
    //---- Trace from right
    if (s1[i2 + 1][j2] === 1 && s1[i2 - 1][j2] === 1) {
      a = s1[i2 + 1][j2 + 1]
      b = s1[i2][j2 - 1]
      c = s1[i2 - 1][j2 - 1]
      if ((a !== 0 && b === 0) || (a === 0 && b !== 0 && c !== 0)) {
        ij3[0] = i2 + 1
        ij3[1] = j2
      } else {
        ij3[0] = i2 - 1
        ij3[1] = j2
      }
    } else if (s1[i2 + 1][j2] === 1 && s1[i2][j2 - 1] === 1) {
      c = s1[i2 - 1][j2]
      d = s1[i2 + 1][j2]
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 + 1][j2 - 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2 + 1
          ij3[1] = j2
        } else {
          ij3[0] = i2
          ij3[1] = j2 - 1
        }
      } else {
        ij3[0] = i2 + 1
        ij3[1] = j2
      }
    } else if (s1[i2 - 1][j2] === 1 && s1[i2][j2 - 1] === 1) {
      c = s1[i2 - 1][j2]
      d = s1[i2 + 1][j2]
      a = s1[i2 - 1][j2 - 1]
      b = s1[i2 + 1][j2 - 1]
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        if ((a === 0 && d === 0) || (b === 0 && c === 0)) {
          ij3[0] = i2 - 1
          ij3[1] = j2
        } else {
          ij3[0] = i2
          ij3[1] = j2 - 1
        }
      } else {
        ij3[0] = i2 - 1
        ij3[1] = j2
      }
    } else if (s1[i2 + 1][j2] === 1) {
      ij3[0] = i2 + 1
      ij3[1] = j2
    } else if (s1[i2 - 1][j2] === 1) {
      ij3[0] = i2 - 1
      ij3[1] = j2
    } else if (s1[i2][j2 - 1] === 1) {
      ij3[0] = i2
      ij3[1] = j2 - 1
    } else {
      canTrace = false
    }
  }
  return canTrace
}
