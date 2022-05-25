# wcontour-js

A JavaScript Library of wContour.

- [wContour](https://github.com/meteoinfo/wContour)
- [wContour_CSharp](https://github.com/meteoinfo/wContour_CSharp)

```js
import { Contour, smoothLines, isolines, isobands } from 'wcontour-js'

const gridOptions = {
  xStart: 70,
  xEnd: 140,
  xDelta: 0.5,
  yStart: 15,
  yEnd: 55,
  yDelta: 0.5,
  xSize: 141,
  ySize: 81,
}
const data =[[...], [...]]
const xs = []
const ys = []

for (let i = 0; i < gridOptions.xSize; i++) {
  xs.push(gridOptions.xStart + i * gridOptions.xDelta)
}
for (let i = 0; i < gridOptions.ySize; i++) {
  ys.push(gridOptions.yStart + i * gridOptions.yDelta)
}
const contour = new Contour(data, xs, ys, 999999)
const breaks = [-10, 0, 10, 20, 30, 40]
const contours = contour.tracingContourLines(breaks)

// smooth
smoothLines(contours)

const polygons = contour.tracingPolygons(contours, breaks)
// 等值线(GeoJSON)
const lineFC = isolines(contours)
// 等值线多边形(GeoJSON)
const polyFC = isobands(polygons, breaks)
```
