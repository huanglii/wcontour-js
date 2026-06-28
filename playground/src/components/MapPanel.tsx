import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { ContourResult } from '../lib/compute'
import type { ColorScheme } from '../lib/colors'
import { buildFillMatch } from '../lib/colors'

interface MapPanelProps {
  result: ContourResult | null
  scheme: ColorScheme
  breaks: number[]
  showLines: boolean
  showBands: boolean
  showLabels: boolean
  showBasemap: boolean
  fitBounds: [number, number, number, number] | null
}

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
const CONTOUR_LAYERS = new Set(['isobands', 'isoline', 'isoline-label'])

export default function MapPanel({ result, scheme, breaks, showLines, showBands, showLabels, showBasemap, fitBounds }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // 初始化地图
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://www.naivemap.com/demotiles/style.json',
      center: [105, 35],
      zoom: 2,
    })

    map.on('load', () => {
      setMapReady(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

  // fitBounds
  useEffect(() => {
    if (!mapRef.current || !mapReady || !fitBounds) return
    mapRef.current.fitBounds(
      [
        [fitBounds[0], fitBounds[1]],
        [fitBounds[2], fitBounds[3]],
      ],
      { padding: 40 }
    )
  }, [fitBounds, mapReady])

  // 切换底图可见性
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    const style = map.getStyle()
    if (!style || !style.layers) return
    for (const layer of style.layers) {
      if (CONTOUR_LAYERS.has(layer.id)) continue
      map.setLayoutProperty(layer.id, 'visibility', showBasemap ? 'visible' : 'none')
    }
  }, [showBasemap, mapReady])

  // 地图就绪后创建等值线/面图层（仅一次）
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    if (map.getLayer('isoline-label')) return // 已创建

    // 等值面
    map.addSource('polygon', { type: 'geojson', data: EMPTY_FC, generateId: true })
    map.addLayer({
      id: 'isobands',
      type: 'fill',
      source: 'polygon',
      layout: { visibility: showBands ? 'visible' : 'none' },
      paint: {
        'fill-color': buildFillMatch(scheme, breaks) as never,
        'fill-opacity': 0.5,
      },
    })

    // 等值线
    map.addSource('line', { type: 'geojson', data: EMPTY_FC, generateId: true })
    map.addLayer({
      id: 'isoline',
      type: 'line',
      source: 'line',
      layout: { visibility: showLines ? 'visible' : 'none' },
      paint: {
        'line-color': scheme.line,
        'line-width': 1,
      },
    })
    map.addLayer({
      id: 'isoline-label',
      type: 'symbol',
      source: 'line',
      layout: {
        visibility: showLabels && showLines ? 'visible' : 'none',
        'text-field': '{value}',
        'symbol-placement': 'line',
        'text-size': 12,
      },
      paint: {
        'text-halo-color': '#fff',
        'text-halo-width': 2,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady])

  // 数据变化时增量更新（不 remove/re-add）
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const polygonSrc = map.getSource('polygon') as maplibregl.GeoJSONSource | undefined
    const lineSrc = map.getSource('line') as maplibregl.GeoJSONSource | undefined

    if (polygonSrc) polygonSrc.setData(result?.polyFC ?? EMPTY_FC)
    if (lineSrc) lineSrc.setData(result?.lineFC ?? EMPTY_FC)
  }, [result, mapReady])

  // 可见性切换
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !map.getLayer('isobands')) return
    map.setLayoutProperty('isobands', 'visibility', showBands ? 'visible' : 'none')
    map.setLayoutProperty('isoline', 'visibility', showLines ? 'visible' : 'none')
    map.setLayoutProperty('isoline-label', 'visibility', showLines && showLabels ? 'visible' : 'none')
  }, [showLines, showBands, showLabels, mapReady])

  // 配色/断点变化时更新 paint
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !map.getLayer('isobands')) return
    map.setPaintProperty('isobands', 'fill-color', buildFillMatch(scheme, breaks) as never)
    map.setPaintProperty('isoline', 'line-color', scheme.line)
  }, [scheme, breaks, mapReady])

  return <div ref={containerRef} className="h-full w-full" />
}
