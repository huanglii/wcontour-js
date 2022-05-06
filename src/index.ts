export { default as Contour } from './contour/Contour'

import { smoothLines } from './contour/utils/contour'
import { getLineStringFeatureCollection, getPolygonFeatureCollection } from './contour/utils/convert'

export const util = {
  smoothLines,
  getLineStringFeatureCollection,
  getPolygonFeatureCollection,
}
