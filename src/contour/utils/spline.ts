import PointD from '../global/PointD'

function f0(t: number): number {
  return (1.0 / 6) * (-t + 1) * (-t + 1) * (-t + 1)
}

function f1(t: number): number {
  return (1.0 / 6) * (3 * t * t * t - 6 * t * t + 4)
}

function f2(t: number): number {
  return (1.0 / 6) * (-3 * t * t * t + 3 * t * t + 3 * t + 1)
}

function f3(t: number): number {
  return (1.0 / 6) * t * t * t
}

export function BSplineScanning(pointList: PointD[], sum: number): PointD[] {
  let t: number
  let i: number
  let X: number, Y: number
  let aPoint: PointD
  let newPList: PointD[] = []

  if (sum < 4) {
    return null
  }

  let isClose = false
  aPoint = pointList[0]
  let bPoint = pointList[sum - 1]
  if (aPoint.x === bPoint.x && aPoint.y === bPoint.y) {
    pointList.splice(0, 1)
    for (let k = 0; k < 7; k++) {
      pointList.push(pointList[k])
    }
    isClose = true
  }

  sum = pointList.length
  for (i = 0; i < sum - 3; i++) {
    const p0 = pointList[i]
    const p1 = pointList[i + 1]
    const p2 = pointList[i + 2]
    const p3 = pointList[i + 3]
    for (t = 0; t <= 1; t += 0.05) {
      const f0t = f0(t)
      const f1t = f1(t)
      const f2t = f2(t)
      const f3t = f3(t)
      X = f0t * p0.x + f1t * p1.x + f2t * p2.x + f3t * p3.x
      Y = f0t * p0.y + f1t * p1.y + f2t * p2.y + f3t * p3.y
      if (isClose) {
        if (i > 3) {
          newPList.push(new PointD(X, Y))
        }
      } else {
        newPList.push(new PointD(X, Y))
      }
    }
  }

  if (isClose) {
    newPList.push(newPList[0])
  } else {
    newPList.splice(0, 0, pointList[0])
    newPList.push(pointList[pointList.length - 1])
  }

  return newPList
}
