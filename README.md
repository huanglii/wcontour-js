# wcontour-js
A JavaScript Library of wContour.

- [wContour](https://github.com/meteoinfo/wContour)
- [wContour_CSharp](https://github.com/meteoinfo/wContour_CSharp)

``` js
import { Contour, uti } from 'wcontour';

const contour = new Contour(data, x, y, undef);
const anlValues = [-10, 0, 10, 20, 30, 40];
const contours = contour.tracingContourLines(anlValues);
uti.smoothLines(contours);
const polygons = contour.tracingPolygons(contours, anlValues);

let lineFeatures = [];
for (let i = 0; i < contours.length; i++) {
  const line = contours[i];
  const feature = uti.getFeatureOfPoints("LineString", line);
  lineFeatures.push(feature);
}

let polyFeatures = [];
for (let polygon of polygons) {
  const polyline = polygon.outLine;
  let feature = uti.getFeatureOfPoints('Polygon', polyline, anlValues, polygon);
  polyFeatures.push(feature);
}
```