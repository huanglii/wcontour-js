import { useEffect, useMemo, useState } from 'react'
import MapPanel from './components/MapPanel'
import ControlPanel, { type PlaygroundState } from './components/ControlPanel'
import StatsBar from './components/StatsBar'
import { makeRealDataset, type GridDataset } from './lib/datasets'
import { loadTiffDataset, tminConfig, precConfig, type TiffDatasetConfig } from './lib/geotiff'
import { useContour } from './hooks/useContour'
import schemes from './lib/colors'
import type { ContourResult } from './lib/compute'

// 下载等值线和等值面 GeoJSON
function downloadGeoJSON(result: ContourResult | null, name: string) {
  if (!result) return
  const fc: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [...result.lineFC.features, ...result.polyFC.features],
  }
  const blob = new Blob([JSON.stringify(fc, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}_contour.geojson`
  a.click()
  URL.revokeObjectURL(url)
}

// TIFF 配置映射
const tiffConfigs: TiffDatasetConfig[] = [tminConfig, precConfig]

// TIFF 占位数据集（仅 name + breaks，data 为空）
function makeTiffPlaceholders(): GridDataset[] {
  return tiffConfigs.map((c) => ({
    name: c.name,
    data: [],
    xs: [],
    ys: [],
    undefData: 999999,
    breaks: c.breaks,
  }))
}

export default function App() {
  const [loadedTiffs, setLoadedTiffs] = useState<Record<string, GridDataset>>({})
  const [loadingName, setLoadingName] = useState<string | null>(null)
  const [state, setState] = useState<PlaygroundState>({
    datasetIdx: 0,
    schemeIdx: 0,
    breaks: [-10, 0, 10, 20, 30, 40],
    undefData: 999999,
    smooth: true,
    showLines: true,
    showBands: true,
    showLabels: true,
    showBasemap: true,
  })

  const realDatasets = useMemo<GridDataset[]>(() => [makeRealDataset()], [])
  const tiffPlaceholders = useMemo(() => makeTiffPlaceholders(), [])
  const datasets = useMemo(() => [...realDatasets, ...tiffPlaceholders], [realDatasets, tiffPlaceholders])

  // 当前数据集：优先用已加载的 TIFF 真实数据
  const currentDataset = useMemo(() => {
    const ds = datasets[state.datasetIdx]
    if (!ds) return null
    return loadedTiffs[ds.name] ?? ds
  }, [datasets, state.datasetIdx, loadedTiffs])

  // 选中 TIFF 且尚未加载时触发加载
  useEffect(() => {
    const ds = datasets[state.datasetIdx]
    if (!ds || ds.data.length > 0) return
    if (loadedTiffs[ds.name] || loadingName === ds.name) return

    const config = tiffConfigs.find((c) => c.name === ds.name)
    if (!config) return

    setLoadingName(ds.name)
    loadTiffDataset(config)
      .then((loaded) => {
        setLoadedTiffs((prev) => ({ ...prev, [ds.name]: loaded }))
        setLoadingName(null)
      })
      .catch((err) => {
        console.error('Failed to load TIFF:', err)
        setLoadingName(null)
      })
  }, [datasets, state.datasetIdx, loadedTiffs, loadingName])

  // 切换数据集时自动同步 breaks
  const handleChange = (next: PlaygroundState) => {
    if (next.datasetIdx !== state.datasetIdx) {
      const ds = datasets[next.datasetIdx]
      if (ds) {
        next.breaks = ds.breaks
      }
    }
    setState(next)
  }

  // TIFF 加载中或 data 为空时不计算
  const effectiveDataset = useMemo(() => {
    if (!currentDataset || currentDataset.data.length === 0) return null
    return currentDataset
  }, [currentDataset])

  const contourParams = useMemo(
    () => ({
      breaks: state.breaks,
      undefData: state.undefData,
      smooth: state.smooth,
    }),
    [state.breaks, state.undefData, state.smooth],
  )

  const result = useContour(effectiveDataset, contourParams)

  const fitBounds = useMemo<[number, number, number, number] | null>(() => {
    if (!currentDataset || currentDataset.xs.length === 0) return null
    const xs = currentDataset.xs
    const ys = currentDataset.ys
    return [xs[0], ys[0], xs[xs.length - 1], ys[ys.length - 1]]
  }, [currentDataset])

  const scheme = schemes[state.schemeIdx] ?? schemes[0]

  return (
    <div className='flex h-screen w-screen overflow-hidden'>
      <aside className='w-80 shrink-0 border-r border-gray-300 bg-white overflow-y-auto'>
        <div className='px-4 py-3 border-b border-gray-300 bg-gray-50'>
          <h1 className='text-lg font-bold text-gray-800'>wcontour-js playground</h1>
          {loadingName && <p className='text-xs text-blue-600 mt-1 animate-pulse'>正在加载 {loadingName}...</p>}
        </div>
        {datasets.length > 0 && <ControlPanel datasets={datasets} state={state} onChange={handleChange} />}

        <div className='px-4 py-3 border-t border-gray-300 bg-gray-50 space-y-2'>
          <button
            type='button'
            disabled={!result}
            onClick={() => downloadGeoJSON(result, currentDataset?.name ?? 'contour')}
            className='w-full px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
          >
            下载 GeoJSON
          </button>
        </div>
      </aside>

      <main className='flex-1 flex flex-col'>
        <StatsBar result={result} />
        <div className='flex-1 relative'>
          <MapPanel
            result={result}
            scheme={scheme}
            breaks={state.breaks}
            showLines={state.showLines}
            showBands={state.showBands}
            showLabels={state.showLabels}
            showBasemap={state.showBasemap}
            fitBounds={fitBounds}
          />
        </div>
      </main>
    </div>
  )
}
