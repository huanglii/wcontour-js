import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Contour, isolines, isobands, smoothLines } from '../src/index'
import { parseGridDataset, type GridDataset } from '../playground/src/lib/datasets'
import { parseTiffDatasetFromFile, precConfig, tminConfig, type TiffDatasetConfig } from '../playground/src/lib/geotiff'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../playground/public')
const fixturesDir = path.resolve(__dirname, '../test/fixtures/playground-geojson')
const coordinatePrecision = 6
const coordinateFactor = 10 ** coordinatePrecision

type DatasetCase =
  | { kind: 'json'; name: 'data'; breaks: number[]; undefData: number; sourcePath: string }
  | { kind: 'tiff'; name: string; step: 1 | 4; breaks: number[]; undefData: number; sourcePath: string; config: TiffDatasetConfig }

const datasetCases: DatasetCase[] = [
  {
    kind: 'json',
    name: 'data',
    breaks: [-10, 0, 10, 20, 30, 40],
    undefData: 999999,
    sourcePath: path.join(publicDir, 'data.json'),
  },
  {
    kind: 'tiff',
    name: 'wc2.1_10m_tmin_08',
    step: 1,
    breaks: tminConfig.breaks,
    undefData: 999999,
    sourcePath: path.join(publicDir, 'wc2.1_10m_tmin_08.tif'),
    config: tminConfig,
  },
  {
    kind: 'tiff',
    name: 'wc2.1_10m_tmin_08',
    step: 4,
    breaks: tminConfig.breaks,
    undefData: 999999,
    sourcePath: path.join(publicDir, 'wc2.1_10m_tmin_08.tif'),
    config: tminConfig,
  },
  {
    kind: 'tiff',
    name: 'wc2.1_10m_prec_08',
    step: 1,
    breaks: precConfig.breaks,
    undefData: 999999,
    sourcePath: path.join(publicDir, 'wc2.1_10m_prec_08.tif'),
    config: precConfig,
  },
  {
    kind: 'tiff',
    name: 'wc2.1_10m_prec_08',
    step: 4,
    breaks: precConfig.breaks,
    undefData: 999999,
    sourcePath: path.join(publicDir, 'wc2.1_10m_prec_08.tif'),
    config: precConfig,
  },
]

// step=1 smooth fixtures are too large for git (>200MB), use hash comparison instead
function useHash(dataset: DatasetCase, smooth: boolean): boolean {
  return dataset.kind === 'tiff' && dataset.step === 1 && smooth
}

function roundCoordinate(value: number): number {
  const rounded = Math.round(value * coordinateFactor) / coordinateFactor
  // Normalize -0 to 0 to avoid cross-runtime JSON differences
  return rounded === 0 ? 0 : rounded
}

function roundRing(coordinates: number[][]): number[][] {
  return coordinates.map(([x, y]) => [roundCoordinate(x), roundCoordinate(y)])
}

function normalizeFeatureCollection(fc: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fc.features.map((feature) => {
      if (feature.geometry.type === 'LineString') {
        return {
          ...feature,
          geometry: {
            type: 'LineString' as const,
            coordinates: roundRing(feature.geometry.coordinates),
          },
        }
      }
      const polygon = feature.geometry as GeoJSON.Polygon
      return {
        ...feature,
        geometry: {
          type: 'Polygon' as const,
          coordinates: polygon.coordinates.map(roundRing),
        },
      }
    }),
  }
}

function generateGeoJSON(dataset: GridDataset, smooth: boolean): GeoJSON.FeatureCollection {
  // Contour constructor mutates data in-place (adds dShift), so clone first
  const data = dataset.data.map((row) => [...row])
  const contour = new Contour(data, dataset.xs, dataset.ys, dataset.undefData)
  let lines = contour.tracingContourLines(dataset.breaks)
  if (smooth) {
    lines = smoothLines(lines)
  }
  const polygons = contour.tracingPolygons(lines, dataset.breaks)
  return {
    type: 'FeatureCollection',
    features: [...isolines(lines).features, ...isobands(polygons, dataset.breaks).features],
  }
}

function hashFeatureCollection(fc: GeoJSON.FeatureCollection): string {
  return createHash('sha256').update(JSON.stringify(fc)).digest('hex')
}

function fixturePath(dataset: DatasetCase, smooth: boolean): string {
  const suffix =
    dataset.kind === 'tiff' ? `_step${dataset.step}_${smooth ? 'smooth' : 'raw'}` : `_${smooth ? 'smooth' : 'raw'}`
  const ext = useHash(dataset, smooth) ? '.hash' : '.geojson'
  return path.join(fixturesDir, `${dataset.name}${suffix}${ext}`)
}

async function loadDataset(dataset: DatasetCase): Promise<GridDataset> {
  if (dataset.kind === 'json') {
    const raw = await readFile(dataset.sourcePath, 'utf8')
    return parseGridDataset(JSON.parse(raw), dataset.name, dataset.undefData, dataset.breaks)
  }
  return parseTiffDatasetFromFile(dataset.sourcePath, { ...dataset.config, name: dataset.name }, dataset.step)
}

async function main() {
  await mkdir(fixturesDir, { recursive: true })
  for (const datasetCase of datasetCases) {
    const dataset = await loadDataset(datasetCase)
    for (const smooth of [false, true]) {
      const output = normalizeFeatureCollection(generateGeoJSON(dataset, smooth))
      const targetPath = fixturePath(datasetCase, smooth)

      if (useHash(datasetCase, smooth)) {
        const hash = hashFeatureCollection(output)
        await writeFile(targetPath, `${hash}\n`, 'utf8')
      } else {
        await writeFile(targetPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
      }
      console.log(`wrote ${path.relative(process.cwd(), targetPath)}`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
