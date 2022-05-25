export default class PointD {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    /**
     * Clone this point
     * @returns New point
     */
    clone(): PointD;
}
