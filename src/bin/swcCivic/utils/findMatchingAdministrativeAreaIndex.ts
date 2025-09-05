import * as turf from '@turf/turf'

import { GeometryData } from '@/bin/swcCivic/utils/getGeometryFromGISData'

const MATCHING_AREA_THRESHOLD = 0.9

export function findMatchingAdministrativeAreaIndex(
  electoralZoneGeometryData: GeometryData,
  allPossibleRegionsGeometryData: Array<GeometryData | undefined>,
) {
  const possibleMatches: Array<{
    administrativeAreaIndex: number
    percentageOfAreaCovered: number
  }> = []

  let index = 0
  for (const regionGeometryData of allPossibleRegionsGeometryData) {
    if (!regionGeometryData) {
      continue
    }

    const intersection = turf.intersect(
      turf.featureCollection([electoralZoneGeometryData, regionGeometryData]),
    )

    const electoralZoneArea = turf.area(electoralZoneGeometryData)
    const intersectionArea = intersection ? turf.area(intersection) : 0

    const percentageOfAreaCovered = (intersectionArea / electoralZoneArea) * 100

    if (percentageOfAreaCovered > MATCHING_AREA_THRESHOLD) {
      possibleMatches.push({
        administrativeAreaIndex: index,
        percentageOfAreaCovered,
      })
    }

    index += 1
  }

  if (possibleMatches.length === 0) {
    return -1
  }

  const bestMatch = possibleMatches.sort(
    (a, b) => b.percentageOfAreaCovered - a.percentageOfAreaCovered,
  )[0]

  return bestMatch.administrativeAreaIndex
}
