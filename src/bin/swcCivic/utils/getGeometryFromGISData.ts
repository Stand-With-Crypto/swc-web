import * as turf from '@turf/turf'
import type { Feature, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson'

import { readGISData } from '@/bin/swcCivic/utils/readGISData'

export type GeometryData = Feature<Polygon | MultiPolygon, GeoJsonProperties>

export function getGeometryFromGISData(
  GISData: NonNullable<Awaited<ReturnType<typeof readGISData>>>['features'][number],
) {
  const regionGeometry = GISData.geometry
  let geometryData: GeometryData

  if (regionGeometry.type === 'Polygon') {
    geometryData = turf.feature(regionGeometry)
  } else if (regionGeometry.type === 'MultiPolygon') {
    geometryData = turf.feature(regionGeometry)
  } else {
    console.warn(`Skipping region with unsupported geometry type: ${regionGeometry.type}`)
    return
  }

  return turf.simplify(geometryData, { tolerance: 0.01, highQuality: false })
}
