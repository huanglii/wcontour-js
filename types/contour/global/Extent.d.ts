export default class Extent {
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    constructor(xMin?: number, xMax?: number, yMin?: number, yMax?: number);
    /**
     * Judge if this extent include another extent
     * @param e The extent
     * @returns Is included or not
     */
    include(e: Extent): boolean;
}
