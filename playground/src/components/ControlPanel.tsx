import { useEffect, useRef } from 'react'
import { Pane } from 'tweakpane'
import type { ContourParams } from '../lib/compute'
import type { GridDataset } from '../lib/datasets'
import schemes from '../lib/colors'

export interface PlaygroundState extends ContourParams {
  datasetIdx: number
  schemeIdx: number
  showLines: boolean
  showBands: boolean
  showLabels: boolean
}

interface ControlPanelProps {
  datasets: GridDataset[]
  state: PlaygroundState
  onChange: (state: PlaygroundState) => void
}

export default function ControlPanel({ datasets, state, onChange }: ControlPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const paneRef = useRef<Pane | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Tweakpane 是命令式的，只在挂载时创建一次
  useEffect(() => {
    if (!containerRef.current) return

    const pane = new Pane({ container: containerRef.current })
    paneRef.current = pane

    // 参数对象：Tweakpane 直接读写这个对象，change 事件回写 React state
    const params = {
      dataset: datasets[stateRef.current.datasetIdx]?.name ?? '',
      breaks: stateRef.current.breaks.join(', '),
      undefData: stateRef.current.undefData,
      smooth: stateRef.current.smooth,
      scheme: schemes[stateRef.current.schemeIdx]?.name ?? '',
      showLines: stateRef.current.showLines,
      showBands: stateRef.current.showBands,
      showLabels: stateRef.current.showLabels,
    }

    const datasetNames = datasets.map((d) => d.name)
    const schemeNames = schemes.map((s) => s.name)

    pane.addBinding(params, 'dataset', { options: Object.fromEntries(datasetNames.map((n) => [n, n])) })

    pane.addBinding(params, 'breaks', { label: 'breaks (csv)' })

    pane.addBinding(params, 'undefData', { label: 'undef', step: 1 })

    pane.addBinding(params, 'smooth')

    pane.addBinding(params, 'scheme', { options: Object.fromEntries(schemeNames.map((n) => [n, n])) })

    const folder = pane.addFolder({ title: 'layers' })
    folder.addBinding(params, 'showLines', { label: 'lines' })
    folder.addBinding(params, 'showBands', { label: 'bands' })
    folder.addBinding(params, 'showLabels', { label: 'labels' })

    pane.on('change', () => {
      const dsIdx = datasetNames.indexOf(params.dataset)
      const schIdx = schemeNames.indexOf(params.scheme)
      const breaks = params.breaks
        .split(/[,;\s]+/)
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n))

      onChange({
        ...stateRef.current,
        datasetIdx: dsIdx >= 0 ? dsIdx : 0,
        schemeIdx: schIdx >= 0 ? schIdx : 0,
        breaks: breaks.length > 0 ? breaks : stateRef.current.breaks,
        undefData: params.undefData,
        smooth: params.smooth,
        showLines: params.showLines,
        showBands: params.showBands,
        showLabels: params.showLabels,
      })
    })

    return () => {
      pane.dispose()
      paneRef.current = null
    }
  }, [datasets, onChange])

  return <div ref={containerRef} className="tp-container" />
}
