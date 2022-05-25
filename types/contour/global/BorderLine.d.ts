import Extent from './Extent';
import IJPoint from './IJPoint';
import PointD from './PointD';
export default class BorderLine {
    area: number;
    extent: Extent;
    isOutLine: boolean;
    isClockwise: boolean;
    pointList: PointD[];
    ijPointList: IJPoint[];
}
