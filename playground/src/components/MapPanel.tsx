import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { ContourResult } from '../lib/compute'
import type { ColorScheme } from '../lib/colors'
import { buildFillMatch } from '../lib/colors'

interface MapPanelProps {
  result: ContourResult | null
  scheme: ColorScheme
  showLines: boolean
  showBands: boolean
  showLabels: boolean
  fitBounds: [number, number, number, number] | null
}

export default function MapPanel({ result, scheme, showLines, showBands, showLabels, fitBounds }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const loadedRef = useRef(false)

  // 初始化地图
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#f8f8f8' },
          },
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [105, 35],
      zoom: 2,
    })

    map.on('load', () => {
      loadedRef.current = true
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      loadedRef.current = false
    }
  }, [])

  // fitBounds
  useEffect(() => {
    if (!mapRef.current || !loadedRef.current || !fitBounds) return
    mapRef.current.fitBounds(
      [
        [fitBounds[0], fitBounds[1]],
        [fitBounds[2], fitBounds[3]],
      ],
      { padding: 40 }
    )
  }, [fitBounds])

  // 更新数据源和图层
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return

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
          'fill-color': buildFillMatch(scheme) as never,
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
  }, [result, scheme, showLines, showBands, showLabels])

  return <div ref={containerRef} className="h-full w-full" />
}
