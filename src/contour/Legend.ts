import LPolygon from './global/LPolygon'
import LegendPara from './global/LegendPara'
import PointD from './global/PointD'

export default class Legend {
  /**
   * Create legend polygons
   *
   * @param aLegendPara legend parameters
   * @return legend polygons
   */
  public static createLegend(aLegendPara: LegendPara): LPolygon[] {
    let polygonList: LPolygon[] = []
    let pList: PointD[]
    let aLPolygon: LPolygon
    let aPoint: PointD
    let i: number, pNum: number
    let aLength: number
    let ifRectangle: boolean

    pNum = aLegendPara.contourValues.length + 1
    aLength = aLegendPara.length / pNum
    if (aLegendPara.isVertical) {
      for (i = 0; i < pNum; i++) {
        pList = []
        ifRectangle = true
        aLPolygon = new LPolygon()
        if (i === 0) {
          aLPolygon.value = aLegendPara.contourValues[0]
          aLPolygon.isFirst = true
          if (aLegendPara.isTriangle) {
            aPoint = new PointD()
            aPoint.x = aLegendPara.startPoint.x + aLegendPara.width / 2
            aPoint.y = aLegendPara.startPoint.y
            pList.push(aPoint)
            aPoint = new PointD()
            aPoint.x = aLegendPara.startPoint.x + aLegendPara.width
            aPoint.y = aLegendPara.startPoint.y + aLength
            pList.push(aPoint)
            aPoint = new PointD()
            aPoint.x = aLegendPara.startPoint.x
            aPoint.y = aLegendPara.startPoint.y + aLength
            pList.push(aPoint)
            ifRectangle = false
          }
        } else {
          aLPolygon.value = aLegendPara.contourValues[i - 1]
          aLPolygon.isFirst = false
          if (i === pNum - 1) {
            if (aLegendPara.isTriangle) {
              aPoint = new PointD()
              aPoint.x = aLegendPara.startPoint.x
              aPoint.y = aLegendPara.startPoint.y + i * aLength
              pList.push(aPoint)
              aPoint = new PointD()
              aPoint.x = aLegendPara.startPoint.x + aLegendPara.width
              aPoint.y = aLegendPara.startPoint.y + i * aLength
              pList.push(aPoint)
              aPoint = new PointD()
              aPoint.x = aLegendPara.startPoint.x + aLegendPara.width / 2
              aPoint.y = aLegendPara.startPoint.y + (i + 1) * aLength
              pList.push(aPoint)
              ifRectangle = false
            }
          }
        }

        if (ifRectangle) {
          aPoint = new PointD()
          aPoint.x = aLegendPara.startPoint.x
          aPoint.y = aLegendPara.startPoint.y + i * aLength
          pList.push(aPoint)
          aPoint = new PointD()
          aPoint.x = aLegendPara.startPoint.x + aLegendPara.width
          aPoint.y = aLegendPara.startPoint.y + i * aLength
          pList.push(aPoint)
          aPoint = new PointD()
          aPoint.x = aLegendPara.startPoint.x + aLegendPara.width
          aPoint.y = aLegendPara.startPoint.y + (i + 1) * aLength
          pList.push(aPoint)
          aPoint = new PointD()
          aPoint.x = aLegendPara.startPoint.x
          aPoint.y = aLegendPara.startPoint.y + (i + 1) * aLength
          pList.push(aPoint)
        }

        pList.push(pList[0])
        aLPolygon.pointList = pList

        polygonList.push(aLPolygon)
      }
    } else {
      for (i = 0; i < pNum; i++) {
        pList = []
        ifRectangle = true
        aLPolygon = new LPolygon()
        if (i === 0) {
          aLPolygon.value = aLegendPara.contourValues[0]
          aLPolygon.isFirst = true
          if (aLegendPara.isTriangle) {
            aPoint = new PointD()
            aPoint.x = aLegendPara.startPoint.x
            aPoint.y = aLegendPara.startPoint.y + aLegendPara.width / 2
            pList.push(aPoint)
            aPoint = new PointD()
            aPoint.x = aLegendPara.startPoint.x + aLength
            aPoint.y = aLegendPara.startPoint.y
            pList.push(aPoint)
            aPoint = new PointD()
            aPoint.x = aLegendPara.startPoint.x + aLength
            aPoint.y = aLegendPara.startPoint.y + aLegendPara.width
            pList.push(aPoint)
            ifRectangle = false
          }
        } else {
          aLPolygon.value = aLegendPara.contourValues[i - 1]
          aLPolygon.isFirst = false
          if (i === pNum - 1) {
            if (aLegendPara.isTriangle) {
              aPoint = new PointD()
              aPoint.x = aLegendPara.startPoint.x + i * aLength
              aPoint.y = aLegendPara.startPoint.y
              pList.push(aPoint)
              aPoint = new PointD()
              aPoint.x = aLegendPara.startPoint.x + (i + 1) * aLength
              aPoint.y = aLegendPara.startPoint.y + aLegendPara.width / 2
              pList.push(aPoint)
              aPoint = new PointD()
              aPoint.x = aLegendPara.startPoint.x + i * aLength
              aPoint.y = aLegendPara.startPoint.y + aLegendPara.width
              pList.push(aPoint)
              ifRectangle = false
            }
          }
        }

        if (ifRectangle) {
          aPoint = new PointD()
          aPoint.x = aLegendPara.startPoint.x + i * aLength
          aPoint.y = aLegendPara.startPoint.y
          pList.push(aPoint)
          aPoint = new PointD()
          aPoint.x = aLegendPara.startPoint.x + (i + 1) * aLength
          aPoint.y = aLegendPara.startPoint.y
          pList.push(aPoint)
          aPoint = new PointD()
          aPoint.x = aLegendPara.startPoint.x + (i + 1) * aLength
          aPoint.y = aLegendPara.startPoint.y + aLegendPara.width
          pList.push(aPoint)
          aPoint = new PointD()
          aPoint.x = aLegendPara.startPoint.x + i * aLength
          aPoint.y = aLegendPara.startPoint.y + aLegendPara.width
          pList.push(aPoint)
        }

        pList.push(pList[0])
        aLPolygon.pointList = pList

        polygonList.push(aLPolygon)
      }
    }

    return polygonList
  }
}
