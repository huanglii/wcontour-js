import Polygon from './global/Polygon';
import PolyLine from './global/PolyLine';
export default class Contour {
    private static _endPointList;
    private _s0;
    private _m;
    private _n;
    private _xs;
    private _ys;
    private _undefData;
    private _s1;
    private _borders;
    constructor(s0: number[][], xs: number[], ys: number[], undefData?: number);
    /**
     * tracing data flag array of the grid data.
     */
    private _tracingDataFlag;
    /**
     * tracing contour borders of the grid data with data flag.
     */
    private _tracingBorders;
    /**
     * Tracing contour lines from the grid data with undefine data
     *
     * @param breaks contour value array
     * @return contour line list
     */
    tracingContourLines(breaks: number[]): PolyLine[];
    /**
     * Tracing polygons from contour lines and borders
     *
     * @param cLineList contour lines
     * @param breaks contour values
     */
    tracingPolygons(cLineList: PolyLine[], breaks: number[]): Polygon[];
    private static isoline_UndefData;
    private static tracingPolygons_Line_Border;
    private static addPolygonHoles;
    /**
     * Tracing stream lines
     *
     * @param U U component array
     * @param V V component array
     * @param X X coordinate array
     * @param Y Y coordinate array
     * @param UNDEF undefine data
     * @param density stream line density
     * @return streamlines
     */
    tracingStreamline(U: number[][], V: number[][], X: number[], Y: number[], UNDEF: number, density: number): PolyLine[];
    private static insertPoint2Border;
    private static insertPoint2Border_Ring;
}
