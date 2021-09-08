import PointD from '../global/PointD'

function BSpline(pointList: PointD[], t: number, i: number): number[] {
  const f: number[] = fb(t)
  let x = 0
  let y = 0
  for (let j = 0; j < 4; j++) {
    const aPoint = pointList[i + j]
    x = x + f[j] * aPoint.x
    y = y + f[j] * aPoint.y
  }
  return [x, y]
}

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

function fb(t: number) {
  return [f0(t), f1(t), f2(t), f3(t)]
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
    //pointList.remove(0);
    pointList.push(pointList[0])
    pointList.push(pointList[1])
    pointList.push(pointList[2])
    pointList.push(pointList[3])
    pointList.push(pointList[4])
    pointList.push(pointList[5])
    pointList.push(pointList[6])
    //pointList.push(pointList[7]);
    //pointList.push(pointList[8]);
    isClose = true
  }

  sum = pointList.length
  for (i = 0; i < sum - 3; i++) {
    for (t = 0; t <= 1; t += 0.05) {
      let xy = BSpline(pointList, t, i)
      X = xy[0]
      Y = xy[1]
      if (isClose) {
        if (i > 3) {
          aPoint = new PointD()
          aPoint.x = X
          aPoint.y = Y
          newPList.push(aPoint)
        }
      } else {
        aPoint = new PointD()
        aPoint.x = X
        aPoint.y = Y
        newPList.push(aPoint)
      }
    }
  }

  if (isClose) {
    newPList.push(newPList[0])
  } else {
    newPList.splice(0, 0, pointList[0])
    //newPList.push(0, pointList[0]);
    newPList.push(pointList[pointList.length - 1])
  }

  return newPList
}
