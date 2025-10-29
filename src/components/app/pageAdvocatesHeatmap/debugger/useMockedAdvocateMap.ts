import { useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'

import {
  AdvocateHeatmapAction,
  ADVOCATES_ACTIONS_BY_COUNTRY_CODE,
  AREA_COORDS_BY_COUNTRY_CODE,
  AreaCoordinates,
  AreaCoordinatesKey,
  AREAS_WITH_SINGLE_MARKER,
  Coords,
  MapProjectionConfig,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import {
  getMapAdministrativeAreaName,
  getRandomOffset,
  MapMarker,
} from '@/components/app/pageAdvocatesHeatmap/useAdvocateMap'
import { useCountryCode } from '@/hooks/useCountryCode'
import { getLogger } from '@/utils/shared/logger'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const logger = getLogger('useMockedAdvocateMap')

/**
 * Distributes 3 markers around a central point with slight random jitter
 * to simulate a natural heat map distribution while keeping markers within bounds.
 * @param centerCoordinates [longitude, latitude] of the central point
 * @param verticalSpacing Base spacing between markers on the vertical axis
 * @returns Array of 3 jittered coordinate pairs
 */
function generateJitteredMarkerPositions(
  centerCoordinates: Coords,
  verticalSpacing: number,
  horizontalRange = 1.2,
  verticalRange = 0.8,
): [Coords, Coords, Coords] {
  return Array.from({ length: 3 }, (_, index) => {
    const horizontalJitter = getRandomOffset(horizontalRange)
    const verticalJitter = getRandomOffset(verticalRange) + verticalSpacing * (index - 1)
    return applyCoordinatesOffset(centerCoordinates, horizontalJitter, verticalJitter)
  }) as [Coords, Coords, Coords]
}

function applyCoordinatesOffset(coordinates: Coords, offsetX: number, offsetY: number): Coords {
  return [coordinates[0] + offsetX, coordinates[1] + offsetY]
}

function getMarkerPositions(
  coordinates: Coords,
  offset: number,
  shouldRandomizeMarkerOffsets = false,
) {
  if (shouldRandomizeMarkerOffsets) {
    return generateJitteredMarkerPositions(coordinates, offset)
  }

  return [
    applyCoordinatesOffset(coordinates, 0, 0),
    applyCoordinatesOffset(coordinates, -offset, offset),
    applyCoordinatesOffset(coordinates, offset, -offset),
  ]
}

function getMarkerMocker({
  actions,
  coordinates,
  countryCode,
  mapMarkerOffset,
  shouldRandomizeMarkerOffsets,
}: {
  actions: Partial<Record<UserActionType, AdvocateHeatmapAction>>
  coordinates: AreaCoordinates
  countryCode: SupportedCountryCodes
  mapMarkerOffset: number
  shouldRandomizeMarkerOffsets?: boolean
}) {
  const getRandomAction = () => {
    const actionKeys = Object.keys(actions)
    const randomIndex = Math.floor(Math.random() * actionKeys.length)
    return actions[actionKeys[randomIndex] as UserActionType] ?? actions.OPT_IN!
  }

  return (administrativeArea: AreaCoordinatesKey) => {
    const administrativeAreaCoords = coordinates[administrativeArea as keyof AreaCoordinates]

    if (!administrativeAreaCoords) {
      logger.error(`No coordinates found for ${administrativeArea}`)
      return []
    }

    const administrativeAreaName = getMapAdministrativeAreaName(countryCode, administrativeArea)

    if (AREAS_WITH_SINGLE_MARKER.includes(administrativeArea)) {
      return [
        {
          id: '1',
          name: administrativeAreaName,
          coordinates: applyCoordinatesOffset(administrativeAreaCoords, 0, 0),
          actionType: UserActionType.EMAIL,
          datetimeCreated: '2021-01-01',
          iconType: getRandomAction(),
        },
      ]
    }

    const actionCoords = getMarkerPositions(
      administrativeAreaCoords,
      mapMarkerOffset,
      shouldRandomizeMarkerOffsets,
    )

    return [
      {
        id: '1',
        name: administrativeAreaName,
        coordinates: actionCoords[0],
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
      {
        id: '2',
        name: administrativeAreaName,
        coordinates: actionCoords[1],
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
      {
        id: '3',
        name: administrativeAreaName,
        coordinates: actionCoords[2],
        actionType: UserActionType.EMAIL,
        datetimeCreated: '2021-01-01',
        iconType: getRandomAction(),
      },
    ]
  }
}

const createMarkersFromActions = ({
  actionsLimit = 20,
  countryCode,
  mapMarkerOffset = 1,
  overrideCoordinates,
  selectedAreas,
  shouldRandomizeMarkerOffsets = false,
}: {
  actionsLimit?: number
  countryCode: SupportedCountryCodes
  mapMarkerOffset?: number
  overrideCoordinates?: AreaCoordinates
  selectedAreas?: AreaCoordinatesKey[]
  shouldRandomizeMarkerOffsets?: boolean
}) => {
  const actions = ADVOCATES_ACTIONS_BY_COUNTRY_CODE[countryCode]
  const coordinates = AREA_COORDS_BY_COUNTRY_CODE[countryCode]

  if (!coordinates) {
    logger.error(`No coordinates found for ${countryCode}`)
    return []
  }

  if (!actions) {
    logger.error(`No actions found for ${countryCode}`)
    return []
  }

  const markerMocker = getMarkerMocker({
    actions,
    coordinates: overrideCoordinates || coordinates,
    countryCode,
    mapMarkerOffset,
    shouldRandomizeMarkerOffsets,
  })

  if (!selectedAreas) {
    return []
  }

  return selectedAreas
    .map(area => markerMocker(area))
    .flat()
    .sort(() => Math.random() - 0.5)
    .slice(0, actionsLimit)
}

export const useMockedAdvocateMap = ({
  mapConfig,
  coordinates,
  selectedAreas,
  actionsLimit,
}: {
  mapConfig: MapProjectionConfig
  coordinates?: AreaCoordinates
  selectedAreas?: AreaCoordinatesKey[]
  actionsLimit?: number
}) => {
  const [displayedMarkers, setDisplayedMarkers] = useState<MapMarker[]>([])
  const countryCode = useCountryCode()

  useEffect(() => {
    setDisplayedMarkers(
      createMarkersFromActions({
        actionsLimit,
        countryCode,
        mapMarkerOffset: mapConfig.markerOffset,
        overrideCoordinates: coordinates,
        selectedAreas,
        shouldRandomizeMarkerOffsets: mapConfig.shouldRandomizeMarkerOffsets,
      }),
    )
  }, [countryCode, mapConfig, coordinates, selectedAreas, actionsLimit])

  return displayedMarkers
}
