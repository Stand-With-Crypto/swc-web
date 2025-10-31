import { useEffect, useMemo, useState } from 'react'
import { UserActionType } from '@prisma/client'

import { getJitteredMarkerPosition } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap.utils'
import {
  AdvocateHeatmapAction,
  ADVOCATES_ACTIONS_BY_COUNTRY_CODE,
  AREA_COORDS_BY_COUNTRY_CODE,
  AREAS_WITH_SINGLE_MARKER,
  Coords,
  MapProjectionConfig,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useCountryCode } from '@/hooks/useCountryCode'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface MapMarker {
  id: string
  name: string
  coordinates: Coords
  actionType: UserActionType
  datetimeCreated: string
  iconType: AdvocateHeatmapAction
  amountUsd?: number
}

const INITIAL_MARKERS = 5
const MAX_MARKERS = 20
const MAX_MARKERS_PER_ADMINISTRATIVE_AREA = 3
const ADVOCATE_MAP_INTERVAL = 2_000

export function getMapAdministrativeAreaName(
  countryCode: SupportedCountryCodes,
  administrativeAreaCode: string,
) {
  if (countryCode === SupportedCountryCodes.AU) {
    return getAUStateNameFromStateCode(administrativeAreaCode)
  }
  if (countryCode === SupportedCountryCodes.CA) {
    return getCAProvinceOrTerritoryNameFromCode(administrativeAreaCode)
  }

  return administrativeAreaCode
}

const createMarkersFromActions = (
  recentActivity: PublicRecentActivity['data'],
  countryCode: SupportedCountryCodes,
  mapMarkerOffset = 1,
  shouldRandomizeMarkerOffsets = false,
): MapMarker[] => {
  const markers: MapMarker[] = []
  const stateCount: Record<string, number> = {}

  const stateCoords = AREA_COORDS_BY_COUNTRY_CODE[countryCode]

  if (!stateCoords) {
    return markers
  }

  const actions = ADVOCATES_ACTIONS_BY_COUNTRY_CODE[countryCode]

  if (!actions) {
    return markers
  }

  const activityWithAdministrativeArea = recentActivity
    .map(item => {
      const userLocation = item.user.userLocationDetails

      const { administrativeAreaLevel1, swcCivicAdministrativeArea } = userLocation ?? {}

      const administrativeArea = (swcCivicAdministrativeArea ??
        administrativeAreaLevel1) as keyof typeof stateCoords

      return {
        ...item,
        administrativeArea,
        coordinates: stateCoords[administrativeArea],
      }
    })
    .filter((item, index, items) => {
      const hasAdministrativeAreaAndCoords =
        Boolean(item.administrativeArea) && Boolean(stateCoords[item.administrativeArea])

      const hasActionConfig = actions[item.actionType]

      const isWithinLimit =
        items
          .slice(0, index)
          .filter(({ administrativeArea }) => administrativeArea === item.administrativeArea)
          .length < MAX_MARKERS_PER_ADMINISTRATIVE_AREA

      return hasAdministrativeAreaAndCoords && hasActionConfig && isWithinLimit
    })

  activityWithAdministrativeArea.forEach(item => {
    let markerCoordinates: Coords = item.coordinates

    // Initialize counter if not exists
    if (!stateCount[item.administrativeArea]) {
      stateCount[item.administrativeArea] = 0
    }

    if (!AREAS_WITH_SINGLE_MARKER.includes(item.administrativeArea)) {
      const markerIndexInArea = stateCount[item.administrativeArea]

      if (shouldRandomizeMarkerOffsets) {
        markerCoordinates = getJitteredMarkerPosition({
          administrativeArea: item.administrativeArea,
          centerCoordinates: item.coordinates,
          countryCode,
          markerIndexInArea,
          verticalSpacing: mapMarkerOffset,
        })
      } else {
        const offsetX = markerIndexInArea % 2 === 0 ? mapMarkerOffset : -mapMarkerOffset
        const offsetY = markerIndexInArea % 2 === 0 ? -mapMarkerOffset : mapMarkerOffset
        markerCoordinates = [item.coordinates[0] + offsetX, item.coordinates[1] + offsetY]
      }

      stateCount[item.administrativeArea] += 1
    }

    const currentIconActionType = actions[item.actionType]!

    markers.push({
      id: item.id,
      name: getMapAdministrativeAreaName(countryCode, item.administrativeArea),
      coordinates: markerCoordinates,
      actionType: item.actionType,
      datetimeCreated: item.datetimeCreated,
      iconType: currentIconActionType,
      amountUsd: 'amountUsd' in item ? item.amountUsd : undefined,
    })
  })

  // Using reverse to make the markers appear in the order they were created
  return markers.reverse()
}

const markersAreSame = (arr1: MapMarker[], arr2: MapMarker[]): boolean => {
  if (arr1.length !== arr2.length) return false
  const ids1 = arr1.map(marker => marker.id).sort()
  const ids2 = arr2.map(marker => marker.id).sort()
  return ids1.every((id, index) => id === ids2[index])
}

export function useAdvocateMap({
  actions,
  mapConfig,
}: {
  actions: PublicRecentActivity
  mapConfig: MapProjectionConfig
}) {
  const [displayedMarkers, setDisplayedMarkers] = useState<MapMarker[]>([])
  const [totalMarkers, setTotalMarkers] = useState<number>(INITIAL_MARKERS - 1)
  const countryCode = useCountryCode()

  const markers = useMemo(
    () =>
      createMarkersFromActions(
        actions.data,
        countryCode,
        mapConfig.markerOffset,
        mapConfig.shouldRandomizeMarkerOffsets,
      ),
    [actions, countryCode, mapConfig],
  )

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (totalMarkers < MAX_MARKERS) {
        setTotalMarkers(prevTotal => Math.min(Math.max(prevTotal + 1, 0), MAX_MARKERS))
      }
    }, ADVOCATE_MAP_INTERVAL)

    return () => clearInterval(intervalId)
  }, [totalMarkers])

  useEffect(() => {
    setDisplayedMarkers(prev => {
      if (markersAreSame(prev, markers)) {
        return prev
      }

      return markers.slice(0, totalMarkers)
    })
  }, [markers, totalMarkers])

  return useMemo(() => displayedMarkers, [displayedMarkers])
}
