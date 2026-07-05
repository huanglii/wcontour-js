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

export function BSplineScanning(pointList: PointD[], _sum: number): PointD[] {
  const newPList: PointD[] = []

  // 不足 4 个点无法进行 B 样条，返回副本以保持纯函数语义
  if (_sum < 4) {
    return pointList.map((p) => p.clone())
  }

  let isClose = false
  const aPoint = pointList[0]
  const bPoint = pointList[_sum - 1]

  let workList: PointD[] = pointList
  if (aPoint.x === bPoint.x && aPoint.y === bPoint.y) {
    workList = pointList.slice()
    workList.splice(0, 1)
    for (let k = 0; k < 7; k++) {
      workList.push(workList[k])
    }
    isClose = true
  }

  const sum = workList.length
  for (let i = 0; i < sum - 3; i++) {
    const p0 = workList[i]
    const p1 = workList[i + 1]
    const p2 = workList[i + 2]
    const p3 = workList[i + 3]
    for (let t = 0; t <= 1; t += 0.05) {
      const f0t = f0(t)
      const f1t = f1(t)
      const f2t = f2(t)
      const f3t = f3(t)
      const X = f0t * p0.x + f1t * p1.x + f2t * p2.x + f3t * p3.x
      const Y = f0t * p0.y + f1t * p1.y + f2t * p2.y + f3t * p3.y
      if (!isClose || i > 3) {
        newPList.push(new PointD(X, Y))
      }
    }
  }

  if (isClose) {
    newPList.push(newPList[0])
  } else {
    newPList.unshift(workList[0])
    newPList.push(workList[workList.length - 1])
  }

  return newPList
}
