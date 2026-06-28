// 数据集加载

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


