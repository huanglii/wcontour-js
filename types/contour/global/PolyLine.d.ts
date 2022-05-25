import PointD from './PointD';
import { PolyLineType } from '../types';
export default class PolyLine {
    value: number;
    type: PolyLineType;
    borderIdx: number;
    pointList: PointD[];
}
