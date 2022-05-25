import Extent from './Extent';
import PointD from './PointD';
import PolyLine from './PolyLine';
export default class Polygon {
    isBorder: boolean;
    isInnerBorder: boolean;
    lowValue: number;
    highValue: number;
    isClockWise: boolean;
    startPointIdx: number;
    isHighCenter: boolean;
    extent: Extent;
    area: number;
    outLine: PolyLine;
    holeLines: PolyLine[];
    holeIndex: number;
    /**
     * clone
     */
    clone(): Polygon;
    /**
     * hasHoles
     */
    hasHoles(): boolean;
    /**
     * addHole
     */
    addHole(polygon: Polygon | PointD[]): void;
}
