import PointD from './PointD';
/**
 * BorderPoint class
 */
export default class BorderPoint {
    id: number;
    borderIdx: number;
    bInnerIdx: number;
    point: PointD;
    value: number;
    /**
     * clone
     */
    clone(): BorderPoint;
}
