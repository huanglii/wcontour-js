// GeoTIFF 栅格数据加载与降采样

import { fromArrayBuffer, fromFile } from 'geotiff'
import type GeoTIFF from 'geotiff'
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

// 从 GeoTIFF 对象解析并降采样为 GridDataset（浏览器和 Node 测试共用）
// step=4 意味着每 4 个像素取 1 个，2160×1080 -> 540×270
export async function parseTiffDataset(tiff: GeoTIFF, config: TiffDatasetConfig, step = 4): Promise<GridDataset> {
  const image = await tiff.getImage()

  const width = image.getWidth()
  const height = image.getHeight()
  const origin = image.getOrigin() // [xMin, yMax, z]
  const resolution = image.getResolution() // [xRes, yRes, zRes]

  // 读取第一波段栅格数据
  const raster = await image.readRasters({ samples: [0] })
  const values = raster[0] as Float32Array | Int16Array | Uint8Array

  const undefData = config.undefData ?? -9999

  const nx = Math.floor(width / step)
  const ny = Math.floor(height / step)

  // 预分配数组
  const xs = new Array<number>(nx)
  const ys = new Array<number>(ny)

  // 直接构建 Float64Array[]（行优先），Contour 可零拷贝复用
  const data = new Array<Float64Array>(ny)

  for (let j = 0; j < nx; j++) {
    xs[j] = origin[0] + j * step * resolution[0]
  }

  // GeoTIFF 数据按行存储从上到下（y 从大到小）
  // Contour 需要 data[i][j] 对应 ys[i], xs[j]，ys 从小到大（从下到上）
  // 读取数据的同时翻转 y 轴，直接写入 Float64Array 行
  for (let i = 0; i < ny; i++) {
    const flippedI = ny - 1 - i
    const srcBase = i * step * width
    const row = new Float64Array(nx)
    for (let j = 0; j < nx; j++) {
      const v = values[srcBase + j * step]
      row[j] = v === undefData || v < -1000 ? 999999 : v
    }
    data[flippedI] = row
    ys[flippedI] = origin[1] + i * step * resolution[1]
  }

  return { name: config.name, data, xs, ys, undefData: 999999, breaks: config.breaks }
}

// 从本地文件路径加载 GeoTIFF（Node 测试用）
export async function parseTiffDatasetFromFile(filePath: string, config: TiffDatasetConfig, step = 4): Promise<GridDataset> {
  const tiff = await fromFile(filePath)
  return parseTiffDataset(tiff, config, step)
}

// 从 URL 加载 GeoTIFF 并降采样为 GridDataset（浏览器用）
export async function loadTiffDataset(config: TiffDatasetConfig, step = 1): Promise<GridDataset> {
  const res = await fetch(config.url)
  const arrayBuffer = await res.arrayBuffer()
  const tiff = await fromArrayBuffer(arrayBuffer)
  return parseTiffDataset(tiff, config, step)
}
