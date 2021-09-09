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
