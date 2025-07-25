import { useEffect, useMemo, useState } from 'react'
import { UserActionType } from '@prisma/client'

import {
  AdvocateHeatmapAction,
  ADVOCATES_ACTIONS_BY_COUNTRY_CODE,
  AREA_COORDS_BY_COUNTRY_CODE,
  AREAS_WITH_SINGLE_MARKER,
  MapProjectionConfig,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { PublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface MapMarker {
  id: string
  name: string
  coordinates: [number, number]
  actionType: UserActionType
  datetimeCreated: string
  iconType: AdvocateHeatmapAction
  amountUsd?: number
}

const createMarkersFromActions = (
  recentActivity: PublicRecentActivity['data'],
  countryCode: SupportedCountryCodes,
  mapMarkerOffset = 1,
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

  recentActivity.forEach(item => {
    const userLocation = item.user.userLocationDetails

    const { administrativeAreaLevel1, swcCivicAdministrativeArea } = userLocation ?? {}

    if (userLocation && (administrativeAreaLevel1 || swcCivicAdministrativeArea)) {
      const administrativeArea = (swcCivicAdministrativeArea ??
        administrativeAreaLevel1) as keyof typeof stateCoords

      if (!administrativeArea || !stateCoords[administrativeArea]) return

      const coordinates = stateCoords[administrativeArea]

      if (coordinates) {
        let offsetX = 0
        let offsetY = 0

        if (
          stateCount[administrativeArea] &&
          !AREAS_WITH_SINGLE_MARKER.includes(administrativeArea)
        ) {
          offsetX = stateCount[administrativeArea] % 2 === 0 ? mapMarkerOffset : -mapMarkerOffset
          offsetY = stateCount[administrativeArea] % 2 === 0 ? -mapMarkerOffset : mapMarkerOffset

          stateCount[administrativeArea] += 1
        } else {
          stateCount[administrativeArea] = 1
        }

        const currentIconActionType = actions[item.actionType]

        if (!currentIconActionType) {
          return
        }

        markers.push({
          id: item.id,
          name: administrativeArea,
          coordinates: [coordinates[0] + offsetX, coordinates[1] + offsetY],
          actionType: item.actionType,
          datetimeCreated: item.datetimeCreated,
          iconType: currentIconActionType,
          amountUsd: 'amountUsd' in item ? item.amountUsd : undefined,
        })
      }
    }
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

const INITIAL_MARKERS = 5
const MAX_MARKERS = 20
const ADVOCATE_MAP_INTERVAL = 2000

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
    () => createMarkersFromActions(actions.data, countryCode, mapConfig.markerOffset),
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
