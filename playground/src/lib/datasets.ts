// 数据集加载与合成

import { sampleData } from './sampleData'

export interface GridDataset {
  name: string
  data: number[][]
  xs: number[]
  ys: number[]
  undefData: number
  breaks: number[]
}

// 从内联 sampleData 构建真实数据集
export function makeRealDataset(): GridDataset {
  const { gridOptions, data } = sampleData
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < gridOptions.xSize; i++) {
    xs.push(gridOptions.xStart + i * gridOptions.xDelta)
  }
  for (let i = 0; i < gridOptions.ySize; i++) {
    ys.push(gridOptions.yStart + i * gridOptions.yDelta)
  }
  return {
    name: 'temperature',
    data,
    xs,
    ys,
    undefData: 999999,
    breaks: [-10, 0, 10, 20, 30, 40],
  }
}

// 合成水平梯度场：值 = j * step
function makeGradientGrid(nx: number, ny: number, step = 2): GridDataset {
  const data: number[][] = []
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < ny; i++) {
    data[i] = []
    for (let j = 0; j < nx; j++) {
      data[i][j] = j * step
    }
    ys.push(i)
  }
  for (let j = 0; j < nx; j++) {
    xs.push(j)
  }
  const max = (nx - 1) * step
  const breaks: number[] = []
  for (let v = step; v < max; v += step * 2) {
    breaks.push(v)
  }
  return { name: 'gradient', data, xs, ys, undefData: 999999, breaks }
}

// 合成中心峰值场：值 = 距中心距离的反比
function makePeakGrid(nx: number, ny: number): GridDataset {
  const data: number[][] = []
  const xs: number[] = []
  const ys: number[] = []
  const cx = (nx - 1) / 2
  const cy = (ny - 1) / 2
  const maxR = Math.sqrt(cx * cx + cy * cy)
  for (let i = 0; i < ny; i++) {
    data[i] = []
    for (let j = 0; j < nx; j++) {
      const dx = j - cx
      const dy = i - cy
      const r = Math.sqrt(dx * dx + dy * dy)
      data[i][j] = Math.round((1 - r / maxR) * 50)
    }
    ys.push(i)
  }
  for (let j = 0; j < nx; j++) {
    xs.push(j)
  }
  return {
    name: 'peak',
    data,
    xs,
    ys,
    undefData: 999999,
    breaks: [10, 20, 30, 40],
  }
}

// 合成部分 undefined 的梯度场
function makePartialUndefGrid(nx: number, ny: number): GridDataset {
  const ds = makeGradientGrid(nx, ny, 2)
  // 在右下角制造一块 undefined 区域
  for (let i = Math.floor(ny * 0.6); i < ny; i++) {
    for (let j = Math.floor(nx * 0.6); j < nx; j++) {
      ds.data[i][j] = ds.undefData
    }
  }
  ds.name = 'partial-undef'
  return ds
}

export function makeSyntheticDatasets(): GridDataset[] {
  return [makeGradientGrid(30, 20), makePeakGrid(25, 25), makePartialUndefGrid(30, 20)]
}
