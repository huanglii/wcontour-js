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
      const id = layer.id
      if (id === 'isobands' || id === 'isoline' || id === 'isoline-label') continue
      map.setLayoutProperty(id, 'visibility', showBasemap ? 'visible' : 'none')
    }
  }, [showBasemap, mapReady])

  // 更新数据源和图层
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    // 移除旧图层和源
    for (const id of ['isobands', 'isoline', 'isoline-label']) {
      if (map.getLayer(id)) map.removeLayer(id)
    }
    for (const id of ['polygon', 'line']) {
      if (map.getSource(id)) map.removeSource(id)
    }

    if (!result) return

    // 添加等值面
    if (showBands) {
      map.addSource('polygon', {
        type: 'geojson',
        data: result.polyFC,
        generateId: true,
      })
      map.addLayer({
        id: 'isobands',
        type: 'fill',
        source: 'polygon',
        paint: {
          'fill-color': buildFillMatch(scheme, breaks) as never,
          'fill-opacity': 0.5,
        },
      })
    }

    // 添加等值线
    if (showLines) {
      map.addSource('line', {
        type: 'geojson',
        data: result.lineFC,
        generateId: true,
      })
      map.addLayer({
        id: 'isoline',
        type: 'line',
        source: 'line',
        paint: {
          'line-color': scheme.line,
          'line-width': 1,
        },
      })

      if (showLabels) {
        map.addLayer({
          id: 'isoline-label',
          type: 'symbol',
          source: 'line',
          layout: {
            'text-field': '{value}',
            'symbol-placement': 'line',
            'text-size': 12,
          },
          paint: {
            'text-halo-color': '#fff',
            'text-halo-width': 2,
          },
        })
      }
    }
  }, [result, scheme, breaks, showLines, showBands, showLabels, mapReady])

  return <div ref={containerRef} className="h-full w-full" />
}
