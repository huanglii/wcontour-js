import type Polygon from '../global/Polygon';
import type PolyLine from '../global/PolyLine';
export declare function isolines(lines: PolyLine[]): GeoJSON.FeatureCollection<GeoJSON.LineString>;
export declare function isobands(polygons: Polygon[], breaks: number[]): GeoJSON.FeatureCollection<GeoJSON.Polygon>;
