import Border from '../global/Border';
import BorderPoint from '../global/BorderPoint';
import PointD from '../global/PointD';
import Polygon from '../global/Polygon';
import PolyLine from '../global/PolyLine';
export declare function canTraceBorder(s1: number[][], i1: number, i2: number, j1: number, j2: number, ij3: number[]): boolean;
export declare function canTraceIsoline_UndefData(i1: number, i2: number, H: number[][], S: number[][], j1: number, j2: number, X: number[], Y: number[], a2x: number, ij3: number[], a3xy: number[], IsS: boolean[]): boolean;
export declare function tracingPolygons_Ring(LineList: PolyLine[], borderList: BorderPoint[], aBorder: Border, contour: number[], pNums: number[]): Polygon[];
export declare function tracingClipPolygons(inPolygon: Polygon, LineList: PolyLine[], borderList: BorderPoint[]): Polygon[];
export declare function tracingStreamlinePoint(aPoint: PointD, Dx: number[][], Dy: number[][], X: number[], Y: number[], iijj: number[], isForward: boolean): boolean;