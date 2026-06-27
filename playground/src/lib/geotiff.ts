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
  breaks: [-40, -20, -10, 0, 5, 10, 15, 20, 25, 30],
}

// WorldClim 降水（8月）
export const precConfig: TiffDatasetConfig = {
  name: 'prec_08',
  url: 'wc2.1_10m_prec_08.tif',
  breaks: [10, 25, 50, 100, 150, 200, 300, 400, 500],
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
  for (let i = 0; i < ny; i++) {
    ys.push(origin[1] + i * step * resolution[1])
    data[i] = []
  }

  // GeoTIFF 数据按行存储，从上到下（y 从大到小）
  // Contour 需要 data[i][j] 对应 ys[i], xs[j]
  // ys 从 origin[1]（top）递减，所以 data[0] 是最北边一行
  for (let i = 0; i < ny; i++) {
    const row = i * step
    for (let j = 0; j < nx; j++) {
      const col = j * step
      const idx = row * width + col
      const v = values[idx]
      data[i][j] = v === undefData || v < -1000 ? 999999 : v
    }
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
