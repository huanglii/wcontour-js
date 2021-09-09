export { default as Contour } from './contour/Contour'
import { smoothLines } from './contour/utils/contour'
import { getFeatureOfPoints } from './contour/utils/convert'

export const uti = {
  smoothLines,
  getFeatureOfPoints,
}
