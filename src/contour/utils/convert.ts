import type Polygon from '../global/Polygon'
import type PolyLine from '../global/PolyLine'

/**
 * PolyLine 转换为 GeoJSON.Feature<GeoJSON.LineString>
 * @param {PolyLine} line
 * @returns
 */
function getLineStringFeature(line: PolyLine): GeoJSON.Feature<GeoJSON.LineString> {
  const coordinates = line.pointList.map((point) => [point.x, point.y])
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates,
    },
    properties: { value: line.value },
  }
}

export function getLineStringFeatureCollection(lines: PolyLine[]): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const features = []
  for (const line of lines) {
    const feature = getLineStringFeature(line)
    features.push(feature)
  }
  return {
    type: 'FeatureCollection',
    features: features,
  }
}

/**
 * Polygon 转换为 GeoJSON.Feature<GeoJSON.Polygon>
 * @param {Polygon} polygon
 * @returns
 */
function getPolygonFeature(polygon: Polygon): GeoJSON.Feature<GeoJSON.Polygon> {
  const coordinates = polygon.outLine.pointList.map((point) => [point.x, point.y])
  const polygonCoordinates = [coordinates]

  // console.log(polygon)

  if (polygon.hasHoles()) {
    for (let i = 0; i < polygon.holeLines.length; i++) {
      const hole = polygon.holeLines[i]
      const holeCoors = []
      for (let _b = 0, _c = hole.pointList; _b < _c.length; _b++) {
        const pt = _c[_b]
        holeCoors.push([pt.x, pt.y])
      }
      polygonCoordinates.push(holeCoors)
    }
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: polygonCoordinates,
    },
    properties: { minValue: polygon.lowValue, maxValue: polygon.highValue },
  }
}

export function getPolygonFeatureCollection(polygons: Polygon[]): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const features = []
  for (const polygon of polygons) {
    const feature = getPolygonFeature(polygon)
    features.push(feature)
  }

  return {
    type: 'FeatureCollection',
    features: features,
  }
}

export function getFeatureOfPoints(typeStr, currentLine, anVals, polygon) {
  var coors = []
  for (var _i = 0, _a = currentLine.pointList; _i < _a.length; _i++) {
    var pt = _a[_i]
    coors.push([pt.x, pt.y])
  }
  var geometry
  var val = currentLine.value
  if (typeStr === 'LineString') {
    geometry = {
      type: 'LineString',
      coordinates: coors,
    }
  } else {
    geometry = {
      type: 'Polygon',
      coordinates: [coors],
    }
    if (polygon && anVals) {
      if (polygon.isHighCenter) {
        var idx = anVals.indexOf(polygon.lowValue)
        if (idx >= 0 && idx < anVals.length - 1) val = anVals[idx + 1]
        else val = polygon.highValue
      } else {
        val = polygon.lowValue
      }
      if (polygon.hasHoles()) {
        for (var i = 0; i < polygon.holeLines.length; i++) {
          var hole = polygon.holeLines[i]
          var holeCoors = []
          for (var _b = 0, _c = hole.pointList; _b < _c.length; _b++) {
            var pt = _c[_b]
            holeCoors.push([pt.x, pt.y])
          }
          geometry['coordinates'].push(holeCoors)
        }
      }
    }
  }
  var properties = {
    id: currentLine.BorderIdx,
    value: val,
  }
  var feature = {
    type: 'Feature',
    geometry: geometry,
    properties: properties,
  }
  return feature
}
