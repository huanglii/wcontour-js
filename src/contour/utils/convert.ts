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

export function isolines(lines: PolyLine[]): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: 'FeatureCollection',
    features: lines.map(getLineStringFeature),
  }
}

/**
 * Polygon 转换为 GeoJSON.Feature<GeoJSON.Polygon>
 * @param {Polygon} polygon
 * @returns
 */
function getPolygonFeature(polygon: Polygon, breaks: number[]): GeoJSON.Feature<GeoJSON.Polygon> {
  const { outLine, holeLines } = polygon
  const coordinates = outLine.pointList.map((point) => [point.x, point.y])
  const polygonCoordinates = [coordinates]
  let value = outLine.value

  if (polygon.isHighCenter) {
    const idx = breaks.indexOf(polygon.lowValue)
    if (idx >= 0 && idx < breaks.length - 1) {
      value = breaks[idx + 1]
    } else {
      value = polygon.lowValue
    }
  }

  if (polygon.hasHoles()) {
    for (const hole of holeLines) {
      polygonCoordinates.push(hole.pointList.map((pt) => [pt.x, pt.y]))
    }
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: polygonCoordinates,
    },
    properties: { value },
  }
}

export function isobands(polygons: Polygon[], breaks: number[]): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  return {
    type: 'FeatureCollection',
    features: polygons.map((polygon) => getPolygonFeature(polygon, breaks)),
  }
}

// export function getFeatureOfPoints(typeStr, currentLine, anVals, polygon) {
//   var coors = []
//   for (var _i = 0, _a = currentLine.pointList; _i < _a.length; _i++) {
//     var pt = _a[_i]
//     coors.push([pt.x, pt.y])
//   }
//   var geometry
//   var val = currentLine.value
//   if (typeStr === 'LineString') {
//     geometry = {
//       type: 'LineString',
//       coordinates: coors,
//     }
//   } else {
//     geometry = {
//       type: 'Polygon',
//       coordinates: [coors],
//     }
//     if (polygon && anVals) {
//       if (polygon.isHighCenter) {
//         var idx = anVals.indexOf(polygon.lowValue)
//         if (idx >= 0 && idx < anVals.length - 1) val = anVals[idx + 1]
//         else val = polygon.highValue
//       } else {
//         val = polygon.lowValue
//       }
//       if (polygon.hasHoles()) {
//         for (var i = 0; i < polygon.holeLines.length; i++) {
//           var hole = polygon.holeLines[i]
//           var holeCoors = []
//           for (var _b = 0, _c = hole.pointList; _b < _c.length; _b++) {
//             var pt = _c[_b]
//             holeCoors.push([pt.x, pt.y])
//           }
//           geometry['coordinates'].push(holeCoors)
//         }
//       }
//     }
//   }
//   var properties = {
//     id: currentLine.BorderIdx,
//     value: val,
//   }
//   var feature = {
//     type: 'Feature',
//     geometry: geometry,
//     properties: properties,
//   }
//   return feature
// }
