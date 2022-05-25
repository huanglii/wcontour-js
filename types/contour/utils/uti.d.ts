import BorderPoint from '../global/BorderPoint';
import Extent from '../global/Extent';
import Line from '../global/Line';
import PointD from '../global/PointD';
import Polygon from '../global/Polygon';
import PolyLine from '../global/PolyLine';
export declare function doubleEquals(a: number, b: number): boolean;
export declare function distance_point2line(pt1: PointD, pt2: PointD, point: PointD): number;
export declare function getExtent(pList: PointD[]): Extent;
export declare function getExtentAndArea(pList: PointD[], aExtent: Extent): number;
export declare function getCrossPointD(lineA: Line, lineB: Line): PointD;
export declare function isLineSegmentCross(lineA: Line, lineB: Line): boolean;
export declare function isExtentCross(aBound: Extent, bBound: Extent): boolean;
/**
 * Determine if the point list is clockwise
 *
 * @param pointList point list
 * @return is or not clockwise
 */
export declare function isClockwise(pointList: PointD[]): boolean;
export declare function twoPointsInside(a1: number, a2: number, b1: number, b2: number): boolean;
/**
 * Judge if a point is in a polygon
 *
 * @param aPolygon polygon
 * @param aPoint point
 * @return if the point is in the polygon
 */
export declare function pointInPolygon(aPolygon: Polygon, aPoint: PointD): boolean;
/**
 * Judge if a point is in a polygon
 *
 * @param poly polygon border
 * @param aPoint point
 * @return if the point is in the polygon
 */
export declare function pointInPolygonByPList(poly: PointD[], aPoint: PointD): boolean;
export declare function judgePolygonHighCenter(borderPolygons: Polygon[], closedPolygons: Polygon[], aLineList: PolyLine[], borderList: BorderPoint[]): Polygon[];
export declare function addHoles_Ring(polygonList: Polygon[], holeList: PointD[][]): void;
export declare function addPolygonHoles_Ring(polygonList: Polygon[]): Polygon[];
