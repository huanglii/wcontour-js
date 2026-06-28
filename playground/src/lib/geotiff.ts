// GeoTIFF 栅格数据加载与降采样

import { fromArrayBuffer } from 'geotiff'
import type { GridDataset } from './datasets'

export interface TiffDatasetConfig {
  name: string
  url: string
  breaks: number[]
  undefData?: number
}

// WorldClim 温度（8月最低温）
export const tminConfig: TiffDatasetConfig = {
  name: 'tmin_08',
  url: 'wc2.1_10m_tmin_08.tif',
  breaks: [-40, -30, -20, -10, 0, 10, 20, 30, 40],
}

// WorldClim 降水（8月）
export const precConfig: TiffDatasetConfig = {
  name: 'prec_08',
  url: 'wc2.1_10m_prec_08.tif',
  breaks: [10, 50, 100, 200, 250, 500, 800, 1000, 1500],
}

// 从 GeoTIFF 加载并降采样为 GridDataset
// step=4 意味着每 4 个像素取 1 个，2160×1080 → 540×270
export async function loadTiffDataset(config: TiffDatasetConfig, step = 4): Promise<GridDataset> {
  const res = await fetch(config.url)
  const arrayBuffer = await res.arrayBuffer()
  const tiff = await fromArrayBuffer(arrayBuffer)
  const image = await tiff.getImage()

  const width = image.getWidth()
  const height = image.getHeight()
  const origin = image.getOrigin() // [xMin, yMax, z]
  const resolution = image.getResolution() // [xRes, yRes, zRes]

  // 读取全部栅格数据（单波段）
  const raster = await image.readRasters()
  const values = raster[0] as Float32Array | Int16Array | Uint8Array

  const undefData = config.undefData ?? -9999

  const nx = Math.floor(width / step)
  const ny = Math.floor(height / step)

  const xs: number[] = []
  const ys: number[] = []
  const data: number[][] = []

  for (let j = 0; j < nx; j++) {
    xs.push(origin[0] + j * step * resolution[0])
  }

  // GeoTIFF 数据按行存储，从上到下（y 从大到小）
  // Contour 需要 data[i][j] 对应 ys[i], xs[j]，且 ys 从小到大（从下到上）
  // 因此先按原始顺序读取，再翻转 y 轴
  const rows: number[][] = []
  for (let i = 0; i < ny; i++) {
    const row = i * step
    rows[i] = []
    for (let j = 0; j < nx; j++) {
      const col = j * step
      const idx = row * width + col
      const v = values[idx]
      rows[i][j] = v === undefData || v < -1000 ? 999999 : v
    }
  }

  // 翻转 y 轴：rows[0]（最北）变成 data[ny-1]（最上），ys 从小到大
  for (let i = 0; i < ny; i++) {
    const flippedI = ny - 1 - i
    data[flippedI] = rows[i]
    ys[flippedI] = origin[1] + i * step * resolution[1]
  }

  return {
    name: config.name,
    data,
    xs,
    ys,
    undefData: 999999,
    breaks: config.breaks,
  }
}
