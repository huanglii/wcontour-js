import PointD from '../global/PointD';
import PolyLine from '../global/PolyLine';
/**
 * Smooth points
 *
 * @param pointList point list
 * @return smoothed point list
 */
export declare function smoothPoints(pointList: PointD[]): PointD[];
/**
 * Smooth polylines
 *
 * @param aLineList polyline list
 * @return smoothed polyline list
 */
export declare function smoothLines(aLineList: PolyLine[]): PolyLine[];
