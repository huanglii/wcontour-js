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
  showBasemap: boolean
}

interface ControlPanelProps {
  datasets: GridDataset[]
  state: PlaygroundState
  onChange: (state: PlaygroundState) => void
}

export default function ControlPanel({ datasets, state, onChange }: ControlPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const paneRef = useRef<Pane | null>(null)
  const paramsRef = useRef<Record<string, unknown>>({})
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const stateRef = useRef(state)
  stateRef.current = state

  const datasetNames = datasets.map((d) => d.name)
  const schemeNames = schemes.map((s) => s.name)

  // 只在 datasets 变化时创建 pane（datasets 由 useMemo 稳定）
  useEffect(() => {
    if (!containerRef.current) return

    const pane = new Pane({ container: containerRef.current })
    paneRef.current = pane

    const params = {
      dataset: datasetNames[state.datasetIdx] ?? '',
      breaks: state.breaks.join(', '),
      undefData: state.undefData,
      smooth: state.smooth,
      scheme: schemeNames[state.schemeIdx] ?? '',
      showLines: state.showLines,
      showBands: state.showBands,
      showLabels: state.showLabels,
      showBasemap: state.showBasemap,
    }
    paramsRef.current = params

    pane.addBinding(params, 'dataset', { options: Object.fromEntries(datasetNames.map((n) => [n, n])) })
    pane.addBinding(params, 'breaks', { label: 'breaks (csv)' })
    pane.addBinding(params, 'undefData', { label: 'undef', step: 1 })
    pane.addBinding(params, 'smooth')
    pane.addBinding(params, 'scheme', { options: Object.fromEntries(schemeNames.map((n) => [n, n])) })

    const folder = pane.addFolder({ title: 'layers' })
    folder.addBinding(params, 'showLines', { label: 'lines' })
    folder.addBinding(params, 'showBands', { label: 'bands' })
    folder.addBinding(params, 'showLabels', { label: 'labels' })
    folder.addBinding(params, 'showBasemap', { label: 'basemap' })

    pane.on('change', () => {
      const dsIdx = datasetNames.indexOf(params.dataset as string)
      const schIdx = schemeNames.indexOf(params.scheme as string)
      const breaks = (params.breaks as string)
        .split(/[,;\s]+/)
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n))

      onChangeRef.current({
        ...stateRef.current,
        datasetIdx: dsIdx >= 0 ? dsIdx : 0,
        schemeIdx: schIdx >= 0 ? schIdx : 0,
        breaks: breaks.length > 0 ? breaks : stateRef.current.breaks,
        undefData: params.undefData as number,
        smooth: params.smooth as boolean,
        showLines: params.showLines as boolean,
        showBands: params.showBands as boolean,
        showLabels: params.showLabels as boolean,
        showBasemap: params.showBasemap as boolean,
      })
    })

    return () => {
      pane.dispose()
      paneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets])

  // 外部 state 变化时同步回 Tweakpane（如切换数据集后 breaks 被自动更新）
  useEffect(() => {
    const params = paramsRef.current
    const pane = paneRef.current
    if (!params || !pane) return

    const dsName = datasetNames[state.datasetIdx] ?? ''
    const schName = schemeNames[state.schemeIdx] ?? ''
    const breaksStr = state.breaks.join(', ')

    // 仅更新实际变化的字段，避免循环触发
    if (params.dataset !== dsName) params.dataset = dsName
    if (params.breaks !== breaksStr) params.breaks = breaksStr
    if (params.scheme !== schName) params.scheme = schName
    if (params.undefData !== state.undefData) params.undefData = state.undefData
    if (params.smooth !== state.smooth) params.smooth = state.smooth
    if (params.showLines !== state.showLines) params.showLines = state.showLines
    if (params.showBands !== state.showBands) params.showBands = state.showBands
    if (params.showLabels !== state.showLabels) params.showLabels = state.showLabels
    if (params.showBasemap !== state.showBasemap) params.showBasemap = state.showBasemap

    pane.refresh()
  })

  return <div ref={containerRef} className="tp-container" />
}
