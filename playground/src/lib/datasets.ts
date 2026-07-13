// 数据集加载

export interface GridDataset {
  name: string
  data: number[][]
  xs: number[]
  ys: number[]
  undefData: number
  breaks: number[]
}

// public/data.json 的结构
interface DataJson {
  gridOptions: {
    xGridStart: number
    xEnd: number
    xDelta: number
    yStart: number
    yEnd: number
    yDelta: number
    xSize: number
    ySize: number
  }
  data: number[][]
}

// 从 public/data.json 异步加载真实数据集
export async function loadRealDataset(): Promise<GridDataset> {
  const res = await fetch('data.json')
  const json: DataJson = await res.json()
  const { gridOptions, data } = json
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < gridOptions.xSize; i++) {
    xs.push(gridOptions.xGridStart + i * gridOptions.xDelta)
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


