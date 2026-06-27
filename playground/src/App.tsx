import { useMemo, useState } from 'react'
import MapPanel from './components/MapPanel'
import ControlPanel, { type PlaygroundState } from './components/ControlPanel'
import StatsBar from './components/StatsBar'
import { makeRealDataset, makeSyntheticDatasets, type GridDataset } from './lib/datasets'
import { useContour } from './hooks/useContour'
import schemes from './lib/colors'

export default function App() {
  const [state, setState] = useState<PlaygroundState>({
    datasetIdx: 0,
    schemeIdx: 0,
    breaks: [-10, 0, 10, 20, 30, 40],
    undefData: 999999,
    smooth: true,
    showLines: true,
    showBands: true,
    showLabels: true,
  })

  // 构建数据集（全部同步，无网络请求）
  const datasets = useMemo<GridDataset[]>(() => [makeRealDataset(), ...makeSyntheticDatasets()], [])

  const currentDataset = datasets[state.datasetIdx] ?? null

  const contourParams = useMemo(
    () => ({
      breaks: state.breaks,
      undefData: state.undefData,
      smooth: state.smooth,
    }),
    [state.breaks, state.undefData, state.smooth]
  )

  const result = useContour(currentDataset, contourParams)

  // 计算 fitBounds
  const fitBounds = useMemo<[number, number, number, number] | null>(() => {
    if (!currentDataset) return null
    const xs = currentDataset.xs
    const ys = currentDataset.ys
    return [xs[0], ys[0], xs[xs.length - 1], ys[ys.length - 1]]
  }, [currentDataset])

  const scheme = schemes[state.schemeIdx] ?? schemes[0]

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* 左侧控制面板 */}
      <aside className="w-80 shrink-0 border-r border-gray-300 bg-white overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
          <h1 className="text-lg font-bold text-gray-800">wcontour-js playground</h1>
        </div>
        {datasets.length > 0 && <ControlPanel datasets={datasets} state={state} onChange={setState} />}
      </aside>

      {/* 右侧地图区域 */}
      <main className="flex-1 flex flex-col">
        <StatsBar result={result} />
        <div className="flex-1 relative">
          <MapPanel
            result={result}
            scheme={scheme}
            showLines={state.showLines}
            showBands={state.showBands}
            showLabels={state.showLabels}
            fitBounds={fitBounds}
          />
        </div>
      </main>
    </div>
  )
}
